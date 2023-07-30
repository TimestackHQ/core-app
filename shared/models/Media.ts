import * as mongoose from "mongoose";
import { AWS } from "../index";
import { IMedia } from "../@types/Media";
import { MEDIA_QUALITY_OPTIONS, MEDIA_STATUSES, PRIMITIVE_MEDIA_QUALITY } from "../consts";
import { ExtendedMongoSchema } from "./helpers";
import { AWSS3ObjectType } from "../@types/global";

const MediaSchema = new ExtendedMongoSchema({

    user: {
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User",
    },

    files: {
        storageLocation: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: false,
        },
        quality: {
            type: String,
            required: true,
            enum: MEDIA_QUALITY_OPTIONS
        },
        format: {
            type: String,
            required: true,
            enum: MEDIA_QUALITY_OPTIONS
        }
    },

    metadata: {
        type: Object,
        required: true,
        default: {}
    },

    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: MEDIA_STATUSES
    },

    relatedEvents: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Event",
    }],

    relatedGroups: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Group",
    }],

    relatedUsers: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User",
    }]

});

// TODO: Link with IMedia Type
MediaSchema.methods.getThumbnailLocation = async (): Promise<AWSS3ObjectType> => {
    // TODO: This is a hacky way to get around the fact that this is undefined
    // @ts-ignore
    const media: IMedia = this;

    const lowestQualityFile = media.files.map(file => {
        return {
            ...file,
            rank: MEDIA_QUALITY_OPTIONS.indexOf(file.quality)
        }
    }).sort((a, b) => a.rank - b.rank)[0];

    return await AWS.signedUrl(lowestQualityFile.storage.path);
}

// TODO: Same here
MediaSchema.methods.getFullsizeLocation = async (): Promise<AWSS3ObjectType> => {
    // TODO: This is a hacky way to get around the fact that this is undefined
    // @ts-ignore
    const media: IMedia = this;

    const highestQualityFile = media.files.map(file => {
        return {
            ...file,
            rank: MEDIA_QUALITY_OPTIONS.indexOf(file.quality)
        }
    }).sort((a, b) => b.rank - a.rank)[0];

    return await AWS.signedUrl(highestQualityFile.storage.path);
}

export default mongoose.model<IMedia>("Media", MediaSchema);

