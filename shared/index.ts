import mongoose from "mongoose";
import * as Models from "./models";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ValidationResult } from "joi";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import { isObjectIdOrHexString } from "mongoose";
import * as AWS from "./cloud/aws";

export const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

export function Logger(...args: any[]) {
    console.log(...args);
}

export async function config() {

    try {
        await mongoose.connect(String(process.env.MONGODB_URI), {

        });

        Logger(`${process.env.SERVICE_NAME} connected to MongoDB`);
    } catch (err) {
        Logger(err);
        process.exit(1);
    }

}

export const HTTPValidator = (validator: (arg0: any) => ValidationResult, target: "body" | "query" = "body") => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { error } = validator(req[target]);
        if (error)
            res.status(400).json({
                message: Object(error)?.details[0].message
            });
        else next();
    };
};

export async function authCheck(req: Request, res: Response, next: NextFunction) {
    try {
        const token = String(req.headers.authorization).split(" ")[1]
        jwt.verify(token, String(process.env.JWT_SECRET));
        const decodedToken: any = jwt.decode(token);
        // @ts-ignore
        req.user = await Models.User.findById(String(decodedToken?._id)).select("-password -events");

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (!req.user.isConfirmed || req.user.isOnWaitList) {
            console.log(req.path)
            if (req.path.includes("/check")) {
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

export function sendTextMessage(body: string, to: string, mediaUrl?: string) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    return client.messages
        .create({
            body,
            to, // Text this number
            from: String(process.env.TWILIO_PHONE_NUMBER), // From a valid Twilio number,
            mediaUrl
        });
}


export {
    isObjectIdOrHexString,
    Models,
    AWS
}


export function isGreaterVersion(ver1: string, ver2: string) {
    const v1 = ver1.split('.').map(Number);
    const v2 = ver2.split('.').map(Number);

    for (let i = 0; i < v1.length; i++) {
        if (v1[i] > v2[i]) {
            return true;
        } else if (v1[i] < v2[i]) {
            return false;
        }
    }

    return false;
}