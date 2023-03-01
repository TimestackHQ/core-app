import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import {MediaSchema} from "./Media";
import {UserSchema} from "./User";
import {isObjectIdOrHexString} from "mongoose";
import {PushToken} from "./index";

export interface NotificationSchema extends mongoose.Document {
    user?: mongoose.Schema.Types.ObjectId | UserSchema;
    title: string;
    body: string;
    data: {
        type: string;
        payload: any;
    };
    acknowledgedAt?: Date;
    createdAt: Date;
    notify: () => Promise<void>;

}

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: false,
    },
    data: {
        type: {
            type: String,
            required: true,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        }
    },

    acknowledgedAt: {
        type: Date,
        required: false,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    }

});

NotificationSchema.methods.notify = async function () {
    try {
        const {user, title, body, data} = this;

        const pushTokens = await PushToken.find({user: user});

        for (const pushToken of pushTokens) {
            await pushToken.notify(title, body, data);
        }
    } catch(Err) {
        console.log(Err);
    }

}

export default mongoose.model<NotificationSchema>("Notification", NotificationSchema);

