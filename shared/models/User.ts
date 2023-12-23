import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import { commonProperties } from "./utils";
import SMSCode from "./SMSCode";
import { Logger } from "../index";
import { ExtendedMongoDocument } from "../@types/global";
import { ExtendedMongoSchema } from "./helpers";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export interface IUser extends ExtendedMongoDocument {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    phoneNumber?: string;
    isConfirmed: boolean;
    isOnWaitList: boolean;
    birthDate?: Date;
    queuedForDeletionAt?: Date;
    commonProperties: commonProperties;
    profilePictureSource?: string;
    initSMSLogin: (method: "sms" | "email", username: string) => Promise<boolean>;
    checkOTPCode: (code: string, username: string) => Promise<boolean>;
    generateSessionToken: () => Promise<string>;
    pushEvent: (eventName: ("profileUpdate"), payload: any) => void;
    setUsername: (username: string) => void;
}

const UserSchema = new ExtendedMongoSchema({
    firstName: {
        type: String,
        required: false,
        default: "none",
        set: (field: string) => field.trim(),
    },
    lastName: {
        type: String,
        required: false,
        default: "none",
        set: (field: string) => field.trim(),
    },
    username: {
        type: String,
        required: false,
    },
    email: {
        type: String,
    },
    birthDate: {
        type: Date,
        required: false,
    },
    phoneNumber: {
        type: String,
        unique: true,
        set: (field: string) => field.replace(/\s/g, ''),
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    isOnWaitList: {
        type: Boolean,
        default: true,
    },
    profilePictureSource: {
        type: String,
        required: false,
    },
    queuedForDeletionAt: {
        type: Date,
        required: false,
        select: false
    },
    ...commonProperties,
});

UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    username: 'text'
});

UserSchema.methods.initSMSLogin = async function (method: "sms" | "email", username: string) {

    try {
        await client.verify.v2.services('VA57da475a2beaca5b1f40ecc57380bc53')
            .verifications
            .create({to: username, channel: method})
    } catch (e) {
        Logger(e);
        return false;
    }

    return true;
}

UserSchema.methods.checkOTPCode = async function (code: string, username: string) {

    try {
        const verificationCheck = await client.verify.v2.services('VA57da475a2beaca5b1f40ecc57380bc53')
            .verificationChecks
            .create({to: username, code: code})

        if (verificationCheck.status === "approved") {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        Logger(e);
        return false;
    }
}

UserSchema.methods.generateSessionToken = async function () {
    return jwt.sign({
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        isConfirmed: this.isConfirmed,
    }, String(process.env.JWT_SECRET), { expiresIn: "1w" });
}

UserSchema.methods.pushEvent = function (eventName: string, payload: string) {

    console.log(this.events)
    this.events.push({
        name: eventName,
        payload: payload,
        createdAt: new Date(),
    });

}

UserSchema.methods.setUsername = function (username: string) {
    this.username = username.replace(/\s/g, '').toLowerCase();
}

export default mongoose.model<IUser>("User", UserSchema);
