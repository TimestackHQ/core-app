import mongoose from "mongoose";
import { MEDIA_GROUP_STATUSES } from "../consts";
import { SocialProfileInterface } from "../@types/SocialProfile";
import { ExtendedMongoSchema } from "./helpers";
import { IMedia } from "../@types/Media";

export interface IMediaGroup extends ExtendedMongoSchema {
    media: (mongoose.Schema.Types.ObjectId/***/ | IMedia)[];
    status: typeof MEDIA_GROUP_STATUSES[number];
    relatedEvents: (mongoose.Schema.Types.ObjectId/***/ | Event)[];
    relatedSocialProfiles: (mongoose.Schema.Types.ObjectId/***/ | SocialProfileInterface)[];
    relatedUsers: mongoose.Schema.Types.ObjectId/***/[];
    createdAt: Date;
    updatedAt: Date;
}

export const MediaGroupSchema = new ExtendedMongoSchema({
    media: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Media",
    }],
    status: {
        type: String,
        required: true,
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
}, {
    timestamps: true
});

export default mongoose.model<IMediaGroup>("MediaGroup", MediaGroupSchema);