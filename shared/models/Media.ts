import * as mongoose from "mongoose";
import { AWS } from "../index";
import { IMedia } from "../@types/Media";
import { MEDIA_FORMAT_OPTIONS, MEDIA_QUALITY_OPTIONS, MEDIA_STATUSES, MEDIA_TYPES, PRIMITIVE_MEDIA_QUALITY } from "../consts";
import { ExtendedMongoSchema } from "./helpers";
import { AWSS3ObjectType } from "../@types/global";

const MediaSchema = new ExtendedMongoSchema({

    user: {
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User",
    },

    files: [new ExtendedMongoSchema({
        storage: {
            type: {
                path: {
                    type: String,
                    required: true,
                },
                bucket: {
                    type: String,
                    required: true,
                    select: false
                },
                url: {
                    type: String,
                    required: true,
                    select: false
                }
            },
            required: true,
        },
        expiresAt: {
            type: Date,
            required: false,
        },
        quality: {
            type: String,
            required: true,
            enum: MEDIA_QUALITY_OPTIONS,
            set: (value: string) => {
                return value.toLowerCase();
            }
        },
        format: {
            type: String,
            required: true,
            enum: MEDIA_FORMAT_OPTIONS,
            set: (value: string) => {
                return value.toLowerCase();
            }
        }
    }, {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        }
    })],

    metadata: {
        type: Object,
        required: true,
        default: {}
    },

    type: {
        type: String,
        required: true,
        enum: MEDIA_TYPES
    },

    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },

    status: {
        type: String,
        required: true,
        default: MEDIA_STATUSES.find(status => status === "active"),
        enum: MEDIA_STATUSES
    },

    relatedEvents: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Event",
    }],

    relatedSocialProfiles: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "SocialProfile",
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
MediaSchema.methods.getThumbnailLocation = async function (): Promise<AWSS3ObjectType> {

    // TODO: This is a hacky way to get around the fact that this is undefined
    // @ts-ignore
    const media: IMedia = this;


    const lowestQualityFile = media.files.map(file => {
        return {
            ...file.toJSON(),
            rank: MEDIA_QUALITY_OPTIONS.indexOf(file.quality)
        }
    }).sort((a, b) => a.rank - b.rank)[0];

    return await AWS.signedUrl(lowestQualityFile.storage.path);
}

// TODO: Same here
MediaSchema.methods.getFullsizeLocation = async function (): Promise<AWSS3ObjectType> {
    // TODO: This is a hacky way to get around the fact that this is undefined
    // @ts-ignore
    const media: IMedia = this;

    const highestQualityFile = media.files.map(file => {
        return {
            ...file.toJSON(),
            rank: MEDIA_QUALITY_OPTIONS.indexOf(file.quality)
        }
    }).sort((a, b) => b.rank - a.rank)[0];

    return await AWS.signedUrl(highestQualityFile.storage.path);
}

export default mongoose.model<IMedia>("Media", MediaSchema);

