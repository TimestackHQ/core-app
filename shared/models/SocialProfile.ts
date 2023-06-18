import mongoose, { mongo } from "mongoose";
import { SocialProfileInterface } from "../@types/SocialProfile";

const status = ["NONE", "PENDING", "ACTIVE", "BLOCKED"] as const;
export type SharedProfileStatusType = typeof status[number];

const socialProfileSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    pendingUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    status: {
        type: String,
        enum: status,
        default: "PENDING"
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media"
    }]
}, {
    timestamps: true
});

export default mongoose.model<SocialProfileInterface<mongoose.Types.ObjectId>>("SocialProfile", socialProfileSchema);
