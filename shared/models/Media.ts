import * as mongoose from "mongoose";
import {v4 as uuid} from "uuid";
import {GCP} from "../index";

export interface MediaSchema extends mongoose.Document {
    publicId: string;
    storageLocation: string;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    type: string;
    group: string;
    thumbnail: string;
    snapshot: string;
    active: boolean;
    event: mongoose.Types.ObjectId;
    metadata: any;
    getStorageLocation: (type?: ("thumbnail" | "snapshot")) => Promise<string>;
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
    snapshot: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: false,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }
});

MediaSchema.methods.getStorageLocation = async function (type?: "thumbnail" | "snapshot"): Promise<string> {

    if(type === "snapshot" && this?.snapshot) {
        console.log(this.snapshot)
        return await GCP.signedUrl(this.snapshot)
    }

    if(!type) {
        console.log(this.publicId)
        return await GCP.signedUrl(this.publicId)
    }

    console.log(this.thumbnail)
    return await GCP.signedUrl(this.thumbnail)

}

export default mongoose.model<MediaSchema>("Media", MediaSchema);

