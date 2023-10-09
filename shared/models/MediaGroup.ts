import mongoose from "mongoose";
import { MEDIA_GROUP_STATUSES } from "../consts";
import { SocialProfileInterface } from "../@types/SocialProfile";
import { ExtendedMongoSchema } from "./helpers";
import { IMedia } from "../@types/Media";

export interface IMediaGroup extends ExtendedMongoSchema {
    uploadLocalDeviceRef: string,
    media: (mongoose.Schema.Types.ObjectId/***/ | IMedia)[];
    status: typeof MEDIA_GROUP_STATUSES[number];
    relatedEvents: (mongoose.Schema.Types.ObjectId/***/ | Event)[];
    relatedSocialProfiles: (mongoose.Schema.Types.ObjectId/***/ | SocialProfileInterface)[];
    relatedUsers: mongoose.Schema.Types.ObjectId/***/[];
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const MediaGroupSchema = new ExtendedMongoSchema({
    uploadLocalDeviceRef: {
        type: String,
        required: true,
        select: false
    },
    media: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Media",
    }],
    status: {
        type: String,
        required: true,
        default: MEDIA_GROUP_STATUSES.find(status => status === "active"),
        enum: MEDIA_GROUP_STATUSES
    },
    relatedEvents: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Event"
    }],
    relatedSocialProfiles: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "SocialProfile"
    }],
    relatedUsers: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User"
    }],
    timestamp: {
        type: Date,
        required: false,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model<IMediaGroup>("MediaGroup", MediaGroupSchema);