import mongoose from "mongoose";
import { SharedProfileStatusType } from "../models/SocialProfile";
import { MediaType, MediaGroupType } from "./Media";

export interface SocialProfilePermissionsInterface {
    canAdd: boolean;
    canAccept: boolean;
    canUnblock: boolean;
    canUploadMedia: boolean;
}


export interface SocialProfileInterface<T> {
    _id: mongoose.Schema.Types.ObjectId;
    users: T[];
    pendingUsers: mongoose.Schema.Types.ObjectId[];
    status: SharedProfileStatusType;
    media: MediaType[];
    groups: MediaGroupType[];
    addedBy: mongoose.Schema.Types.ObjectId;
    blockedBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    permissions: (userId: mongoose.Schema.Types.ObjectId) => SocialProfilePermissionsInterface;
}

export interface UserInterface {
    _id: mongoose.Schema.Types.ObjectId;
    firstName: string;
    lastName: string;
    username: string;
    profilePictureSource?: string;
}
