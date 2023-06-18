import mongoose from "mongoose";
import { SharedProfileStatusType } from "../models/SocialProfile";

export interface SocialProfileInterface<T> {
    _id: mongoose.Types.ObjectId;
    users: T[];
    pendingUsers: mongoose.Types.ObjectId[];
    status: SharedProfileStatusType;
    media: mongoose.Types.ObjectId[];
    addedBy: mongoose.Types.ObjectId;
    blockedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserInterface {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    username: string;
    profilePictureSource: string;
}
