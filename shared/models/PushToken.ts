import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import {MediaSchema} from "./Media";
import {UserSchema} from "./User";
import {isObjectIdOrHexString} from "mongoose";

export interface PushTokenSchema extends mongoose.Document {
    to: string;
    user?: mongoose.Schema.Types.ObjectId | UserSchema;
    createdAt: Date;
    ipAddress: string;


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

export default mongoose.model<PushTokenSchema>("PushToken", PushTokenSchema);

