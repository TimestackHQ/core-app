import * as mongoose from "mongoose";
import * as Models from "./models";
import {Request, Response, NextFunction} from "express";
import * as Joi from "joi";
import {ValidationResult} from "joi";
import * as jwt from "jsonwebtoken";
import * as twilio from "twilio";
import * as sgMail from "@sendgrid/mail";
sgMail.setApiKey(String(process.env.SENDGRID_API_KEY));
import * as Handlebars from "handlebars";
import {UserSchema} from "./models/User";
import {EventSchema} from "./models/Event";
import * as fs from "fs";
import * as path from "path";
import * as Compress from "./compress";
import {isObjectIdOrHexString} from "mongoose";
// @ts-ignore
import * as JoiObjectId from "joi-objectid";
import moment = require("moment");
//cloud
import * as GCP from "./cloud/gcp";

export const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;


export function Logger (...args: any[]) {
    console.log(...args);
}

export async function config () {

    try {
        await mongoose.connect(String(process.env.MONGODB_URI), {

        });

        Logger(`${process.env.SERVICE_NAME} connected to MongoDB`);
    } catch (err) {
        Logger(err);
        process.exit(1);
    }

}

export const HTTPValidator = (validator: (arg0: unknown) => ValidationResult) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { error } = validator(req.body);
        if (error)
            res.status(400).json({
                message: Object(error)?.details[0].message
            });
        else next();
    };
};

export async function authCheck (req: Request, res: Response, next: NextFunction) {
    try {
        const token = String(req.headers.authorization).split(" ")[1]
        jwt.verify(token, String(process.env.JWT_SECRET));
        const decodedToken: any = jwt.decode(token);
        // @ts-ignore
        req.user = await Models.User.findById(String(decodedToken?._id)).select("-password -events");

        if(!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if(!req.user.isConfirmed || req.user.isOnWaitList) {
            console.log(req.path)
            if(req.path.includes("/check")) {
                return res.status(401).json({
                    status: !req.user.isConfirmed ? "unconfirmed" : req.user.isOnWaitList ? "waitlist" : "ok"
                });
            } else {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }
        }
        next();
    } catch (e) {
        console.log(e);
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
}

export const PhoneNumberValidator = () => Joi.extend(require("joi-phone-number")).string().phoneNumber({
    format: 'international'
})

export function sendTextMessage (body: string, to: string, mediaUrl?: string) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    return client.messages
        .create({
            body,
            to, // Text this number
            from: String(process.env.TWILIO_PHONE_NUMBER), // From a valid Twilio number,
            mediaUrl
        });
}


export const sendEmail = (
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments: {filename: string, type: string, content: Buffer, disposition: string}[] = []
) => sgMail.send({
    to,
    from: {
        name: "Timestack",
        email: 'hello@timestack.world'
    },
    subject,
    text,
    html,
    // @ts-ignore
    attachments
});

export async function notifyOfEvent (event: EventSchema, user: UserSchema, anchor: string) {

    const inviteLink = `${process.env.FRONTEND_URL}/event/${event.publicId}`

    try {
        if(emailRegex.test(anchor)){

            const html = fs
                .readFileSync(path.join(__dirname, "email/eventInviteTemplate.html"))
                .toString()

            const engine = Handlebars.compile(html);
            const htmlToSend = engine({
                hostFirstName: String(user.firstName),
                anchor: String(anchor),
                eventName: event.name,
                inviteLink
            });

            await sendEmail(anchor, `${user.firstName} invited you to ${event.name}`, htmlToSend, htmlToSend);
        } else {
            await sendTextMessage(
                user.firstName + ' invites you to an event: ' + event.name +
                '\n' +
                'Click here to add your availabilities: ' + `${inviteLink}`,
                anchor
            )
        }
    } catch(err: any) {
        console.log(err.response.body);
    }

}

export const inviteToEvent = async (
    event: EventSchema,
    host: UserSchema,
    user: (
        UserSchema | {
            firstName?: string,
            lastName?: string,
            email?: string,
            phoneNumber: string
        }
    ),
) => {

    const inviteLink = `${process.env.MOBILE_APP_URL}/invite/${event.publicId}`;

    try {
        await sendTextMessage(
        host.firstName + ' invites you to ' + event.name + ' on Timestack.' +
                    '\n' +
                    'Click here to join: ' + `${inviteLink}`,

            String(user.phoneNumber),
        )
    } catch(err: any) {
        Logger(err.response.body);
    }

}

export const notifyOfEventConfirmation = async (event: EventSchema, user: UserSchema, anchor: string, inviteLink: string, ics: string) => {
    const html = fs
        .readFileSync(path.join(__dirname, "email/eventConfirmTemplate.html"))
        .toString()

    const engine = Handlebars.compile(html);
    const htmlToSend = engine({
        firstName: String(user.firstName),
        startDate: moment(event.startsAt).format("dddd, MMMM Do YYYY"),
        startTime: moment(event.startsAt).format("h:mm a"),
        endTime: moment(event.endsAt).format("h:mm a"),
        anchor: String(anchor),
        eventName: event.name,
        inviteLink
    });

    console.log(anchor, `${user.firstName} invited you to ${event.name}`, [{
        filename: "invite.ics",
        type: "text/calendar",
        content: Buffer.from(ics),
        disposition: "attachment"
    }])

    await sendEmail(anchor, `${user.firstName} invited you to ${event.name}`, htmlToSend, htmlToSend, [{
        filename: "invite.ics",
        type: "text/calendar",
        // @ts-ignore
        content: Buffer.from(ics).toString('base64'),
        disposition: "attachment"
    }]);

}

export const isObjectIdJoiValidator = JoiObjectId(Joi);

export {
    isObjectIdOrHexString,
    Models,
    GCP,
    Compress
}