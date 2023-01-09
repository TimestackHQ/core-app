import { commonProperties } from "./utils";
import mongoose from "mongoose";
export interface SMSCodeSchema extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    code: string;
    phoneNumber: string;
    expiresAt: Date;
    isConfirmed: boolean;
    commonProperties: commonProperties;
    twilioMessageId: string;
    sendSMS: (code: number) => Promise<boolean>;
}
declare const _default: mongoose.Model<SMSCodeSchema, {}, {}, {}, any>;
export default _default;
