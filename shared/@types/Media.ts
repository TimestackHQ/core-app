import mongoose from "mongoose";
import { UserSchema } from "../models/User";

export type MediaGroupType = {
    name: string;
    media: mongoose.Schema.Types.ObjectId[] | MediaType[];
    timestamp: Date;
}

export interface MediaType extends mongoose.Document {
    publicId: string;
    storageLocation: string;
    user: mongoose.Schema.Types.ObjectId & UserSchema;
    createdAt: Date;
    type: string;
    group: string;
    thumbnail: string;
    snapshot: string;
    active: boolean;
    event: mongoose.Schema.Types.ObjectId;
    metadata: any;
    timestamp: Date;
    getStorageLocation: (type?: ("thumbnail" | "snapshot")) => Promise<string>;
}

