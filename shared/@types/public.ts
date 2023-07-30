import mongoose from "mongoose";
import { SharedProfileStatusType } from "../models/SocialProfile";
import { UserInterface } from "./SocialProfile";
import { AWSS3ObjectType } from "./global";
import { IMedia } from "./Media";
import { MEDIA_HOLDER_TYPES } from "../consts";

export {
    MEDIA_HOLDER_TYPES
}

export type MediaHolderTypesType = typeof MEDIA_HOLDER_TYPES[number];

export interface SocialProfileInterface {
    _id: mongoose.Schema.Types.ObjectId/***/ | null;
    users: UserInterface[],
    status: SharedProfileStatusType;
    canAdd: boolean;
    canAccept: boolean;
    canUnblock: boolean;
    mutualProfilesToDisplay: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePictureSource?: string;
    }[];
    mutualProfilesCount: number;
    activeSince?: Date;
}

export interface ConnectionRequest {
    type: "connectionRequest";
    payload: {
        profileId: string;
        userId: string;
    }
}

export {
    UserInterface
}

export interface MediaInternetType {
    _id: string;
    publicId: string;
    storageLocation?: AWSS3ObjectType,
    snapshot?: AWSS3ObjectType;
    thumbnail?: AWSS3ObjectType;
    createdAt: Date;
    type: string;
    hasPermission: boolean;
    user: string;
    isGroup: boolean;
    timestamp: Date;
    groupMedia?: IMedia[];
}