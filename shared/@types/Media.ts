import mongoose from "mongoose";
import { IUser } from "../models/User";
import { MEDIA_FORMAT_OPTIONS, MEDIA_QUALITY_OPTIONS, MEDIA_STATUSES, MEDIA_TYPES } from "../consts";
import { AWSS3ObjectType, ExtendedMongoDocument } from "./global";

type fileType = {
    _id: mongoose.Schema.Types.ObjectId/***/;
    storage: {
        path: string;
        bucket: string;
        url: string;
    };
    expiresAt?: Date;
    quality: typeof MEDIA_QUALITY_OPTIONS[number];
    format: typeof MEDIA_FORMAT_OPTIONS[number];
    createdAt: Date;
}

export interface IMedia extends ExtendedMongoDocument {

    user: mongoose.Schema.Types.ObjectId/***/ | IUser;

    files: (fileType & {
        toJSON(): fileType;
    })[],

    metadata: {
        [key: string]: any;
    }

    status: typeof MEDIA_STATUSES[number];

    type: typeof MEDIA_TYPES[number];

    relatedEvents: mongoose.Schema.Types.ObjectId/***/[];
    relatedSocialProfiles: mongoose.Schema.Types.ObjectId/***/[];
    relatedGroups: mongoose.Schema.Types.ObjectId/***/[];
    relatedUsers: mongoose.Schema.Types.ObjectId/***/[];

    timestamp: Date;

    createdAt: Date;
    updatedAt: Date;

    getThumbnailLocation(): Promise<AWSS3ObjectType>;
    getFullsizeLocation(): Promise<AWSS3ObjectType>He;
}

