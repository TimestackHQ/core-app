import mongoose from "mongoose";
import { ExtendedMongoSchema } from "./helpers";
import { MEDIA_HOLDER_TYPES } from "../consts";
import {SocialProfileInterface} from "../@types/public";

export interface IContent extends mongoose.Document {
    uploadLocalDeviceRef: string,
    contentId: mongoose.Schema.Types.ObjectId/***/;
    contentType: "media" | "mediaGroup";
    createdAt: Date;
    timestamp: Date;

    events: mongoose.Schema.Types.ObjectId/***/[];

    socialProfiles: mongoose.Schema.Types.ObjectId/***/[] | SocialProfileInterface[];
}


const contentSchema = new ExtendedMongoSchema({
    uploadLocalDeviceRef: {
        type: String,
        required: false
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId/***/,
        required: true

    },
    contentType: {
        type: String,
        enum: ["media", "mediaGroup"]
    },
    createdAt: Date,
    timestamp: Date,
    events: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Event"
    }],
    socialProfiles: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "SocialProfile"
    }],
}, {
    timestamps: {
        createdAt: true,
    }
});

export default mongoose.model<IContent>("Content", contentSchema);
