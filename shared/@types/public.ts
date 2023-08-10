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
    _id: string;
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

export type MediaInternetType = {
    _id: string;
    fullsize?: AWSS3ObjectType,
    thumbnail?: AWSS3ObjectType;
    createdAt: Date;
    type: "image" | "video";
    hasPermission: boolean;
    user: string;
    mediaList: string[]
    groupLength: number;
    timestamp: Date;
    isGroup: boolean;
    isPlaceholder: boolean;
    isProcessing: boolean;
    indexInGroup: number;
}