import * as mongoose from "mongoose";
import { IUser } from "./User";
import axios from "axios";
import { ExtendedMongoDocument } from "../@types/global";
import { ExtendedMongoSchema } from "./helpers";

export interface IPushToken extends ExtendedMongoDocument {
    to: string;
    user?: mongoose.Schema.Types.ObjectId/***/ | IUser;
    createdAt: Date;
    ipAddress: string;
    notify: (title: string, body: string, data: any) => Promise<void>;
}

const PushTokenSchema = new ExtendedMongoSchema({
    to: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId/***/,
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
        badge: 0,
    });

}
export default mongoose.model<IPushToken>("PushToken", PushTokenSchema);

