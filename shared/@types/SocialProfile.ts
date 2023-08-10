import mongoose from "mongoose";
import { SOCIAL_PROFILE_STATUSES } from "../consts";
import { ExtendedMongoDocument } from "./global";
import { IContent } from "../models/Content";

export interface SocialProfilePermissionsInterface {
    canAdd: boolean;
    canAccept: boolean;
    canUnblock: boolean;
    canUploadMedia: boolean;
}


export interface SocialProfileInterface extends ExtendedMongoDocument {
    _id: mongoose.Schema.Types.ObjectId/***/;
    users: (mongoose.Schema.Types.ObjectId/***/ | UserInterface)[];
    pendingUsers: mongoose.Schema.Types.ObjectId/***/[];
    status: typeof SOCIAL_PROFILE_STATUSES[number]
    addedBy: mongoose.Schema.Types.ObjectId/***/;
    blockedBy: mongoose.Schema.Types.ObjectId/***/;
    createdAt: Date;
    updatedAt: Date;
    content: IContent[];
    permissions: (userId: mongoose.Schema.Types.ObjectId/***/) => SocialProfilePermissionsInterface;
}

export interface UserInterface {
    _id: mongoose.Schema.Types.ObjectId/***/;
    firstName: string;
    lastName: string;
    username: string;
    profilePictureSource?: string;
}
