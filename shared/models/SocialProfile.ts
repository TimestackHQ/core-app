import mongoose, { mongo } from "mongoose";
import { SocialProfileInterface, SocialProfilePermissionsInterface } from "../@types/SocialProfile";

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

socialProfileSchema.methods.permissions = function (userId: mongoose.Types.ObjectId): SocialProfilePermissionsInterface {
    return {
        canAdd: this.status === "NONE",
        canAccept: this.status === "PENDING" && this.addedBy.toString() !== userId.toString(),
        canUnblock: this.status === "BLOCKED" && this.blockedBy.toString() === userId.toString(),
        canUploadMedia: this.status === "ACTIVE" || this.status === "PENDING"
    }
}

export default mongoose.model<SocialProfileInterface<mongoose.Types.ObjectId>>("SocialProfile", socialProfileSchema);
