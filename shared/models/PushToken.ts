import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import {MediaSchema} from "./Media";
import {UserSchema} from "./User";
import {isObjectIdOrHexString} from "mongoose";
import axios from "axios";

export interface PushTokenSchema extends mongoose.Document {
    to: string;
    user?: mongoose.Schema.Types.ObjectId | UserSchema;
    createdAt: Date;
    ipAddress: string;
    notify: (title: string, body: string, data: any) => Promise<void>;
}

const PushTokenSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

PushTokenSchema.methods.notify = async function (title: string, body: string, data: any) {
    // use expo api to notify
    await axios.post("https://exp.host/--/api/v2/push/send", {
        to: this.to,
        title,
        body,
        data,
        badge: 1,
    });

}
export default mongoose.model<PushTokenSchema>("PushToken", PushTokenSchema);

