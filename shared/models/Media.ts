import * as mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { GCP } from "../index";
import { UserSchema } from "./User";
import { MediaType } from "../@types/Media";

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
        timestamp: {
            type: Date,
            required: false,
        }
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
    },
});

MediaSchema.methods.getStorageLocation = async function (type?: "thumbnail" | "snapshot") {

    if (type === "snapshot" && this?.snapshot) {
        console.log(this.snapshot)
        return await GCP.signedUrl(this.snapshot)
    }

    if (!type) {
        console.log(this.publicId)
        return await GCP.signedUrl(this.publicId)
    }

    console.log(this.thumbnail)
    return await GCP.signedUrl(this.thumbnail)

}

export default mongoose.model<MediaType>("Media", MediaSchema);

