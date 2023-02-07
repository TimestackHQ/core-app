import * as mongoose from "mongoose";
import {v4 as uuid} from "uuid";

export interface MediaSchema extends mongoose.Document {
    publicId: string;
    storageLocation: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    type: string;
    group: string;
    thumbnail: string;
    active: boolean;
}

const MediaSchema = new mongoose.Schema({

    publicId: {
        type: String,
        required: true,
        default: uuid,
    },
    storageLocation: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
        enum: ["cover", "event"],
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    thumbnail: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model<MediaSchema>("Media", MediaSchema);

