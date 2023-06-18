import mongoose from "mongoose";
import { SharedProfileStatusType } from "../models/SocialProfile";
import { UserInterface } from "./SocialProfile";

export interface SocialProfileInterface {
    _id: mongoose.Types.ObjectId | null;
    users: UserInterface[],
    status: SharedProfileStatusType;
    canAdd: boolean;
    canAccept: boolean;
    canUnblock: boolean;
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