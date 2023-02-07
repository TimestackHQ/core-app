import * as mongoose from "mongoose";
import * as jwt from "jsonwebtoken";
import {commonProperties} from "./utils";
import SMSCode from "./SMSCode";
import {Logger} from "../index";

export interface UserSchema extends mongoose.Document {
    firstName?: string;
    lastName?: string;
    username: string;
    email?: string;
    phoneNumber?: string;
    isConfirmed: boolean;
    commonProperties: commonProperties;

    initSMSLogin: () => Promise<boolean>;
    checkSMSCode: (code: string) => Promise<boolean>;
    generateSessionToken: () => Promise<string>;
}

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: false,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    profilePictureSource: {
        type: String,
        required: false,
    },

    ...commonProperties,
});

UserSchema.index({
    firstName: 'text',
    lastName: 'text',
    username: 'text'
});

UserSchema.methods.initSMSLogin = async function () {
    const code = Math.floor(100000 + Math.random() * 900000);

    try {
        const smsCode = new SMSCode({
            user: this._id,
            code: code.toString(),
            phoneNumber: this.phoneNumber,
        });

        await smsCode.save();
        await smsCode.sendSMS(code);
    } catch (e) {
        Logger(e);
        return false;
    }

    return true;
}

UserSchema.methods.checkSMSCode = async function (code: string) {
    const smsCode = await SMSCode.findOne({user: this._id, code: code, isConfirmed: false}).sort({createdAt: -1});
    if (!smsCode) return false;

    smsCode.isConfirmed = true;
    await smsCode.save();

    return true;
}

UserSchema.methods.generateSessionToken = async function () {
    return jwt.sign({
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        isConfirmed: this.isConfirmed,
    }, String(process.env.JWT_SECRET), {expiresIn: "1w"});
}

export default mongoose.model<UserSchema>("User", UserSchema);
