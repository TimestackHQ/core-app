import * as mongoose from "mongoose";
import { IUser } from "./User";
import { PushToken } from "./index";
import { ConnectionRequest } from "../@types/public";
import { ExtendedMongoDocument } from "../@types/global";
import { IEvent } from "./Event";

export interface INotification extends ExtendedMongoDocument {

    user?: mongoose.Schema.Types.ObjectId/***/ | IUser;
    title: string;
    body: string;
    data: ConnectionRequest | null | {
        type: string;
        payload: {
            eventId?: mongoose.Schema.Types.ObjectId/***/ & IEvent;
            userId?: mongoose.Schema.Types.ObjectId/***/ & IUser;
            eventName?: string;
            userName?: string;
        }
    };
    acknowledgedAt?: Date;
    createdAt: Date;
    notify: () => Promise<void>;

}

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId/***/,
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
            type: Object,
            required: true,
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
        const { user, title, body, data } = this;

        const pushTokens = await PushToken.find({ user: user });

        for (const pushToken of pushTokens) {
            await pushToken.notify(title, body, data);
        }
    } catch (Err) {
        console.log(Err);
    }

}

export default mongoose.model<INotification>("Notification", NotificationSchema);

