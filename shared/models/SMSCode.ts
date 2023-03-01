import {commonProperties} from "./utils";
import mongoose from "mongoose";
import * as moment from "moment";
import * as twilio from "twilio";
import {Logger, sendTextMessage} from "../index";

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

const SMSCodeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: moment().add(5, "minutes").toDate(),
    },
    twilioMessageId: {
        type: String,
        required: false,
    },
    ...commonProperties,
});

SMSCodeSchema.methods.sendSMS = async function (code: number) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    try {
        // if(process.env.NODE_ENV === "development") {
        //     Logger(`SMS sent to ${this.phoneNumber} with code: ${code}`);
        //     return true;
        // } else {
            const message = await sendTextMessage(
                'This is your Timestack authentication code.\n' +
                '\n' +
                'We will never ask you to share this code. \n\n\ Code: '+ code,
                this.phoneNumber,

            )

            this.twilioMessageId = message.sid;
        // }


        return true;
    } catch (e) {
        Logger(e);
        return false;
    }
}

export default mongoose.model<SMSCodeSchema>("SMSCode", SMSCodeSchema);