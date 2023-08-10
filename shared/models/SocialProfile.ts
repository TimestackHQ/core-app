import mongoose, { mongo } from "mongoose";
import { SocialProfileInterface, SocialProfilePermissionsInterface } from "../@types/SocialProfile";
import { SOCIAL_PROFILE_STATUSES } from "../consts";
import { ExtendedMongoSchema } from "./helpers";
import ContentSchema from "./Content";

export type SharedProfileStatusType = typeof SOCIAL_PROFILE_STATUSES[number];

const socialProfileSchema = new ExtendedMongoSchema({
    users: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User"
    }],
    pendingUsers: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User"
    }],
    status: {
        type: String,
        enum: SOCIAL_PROFILE_STATUSES,
        default: "PENDING"
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User"
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User"
    },
    content: {
        type: [mongoose.Schema.Types.ObjectId]/***/,
        default: [],
        ref: "Content",
        required: true
    }
});

socialProfileSchema.methods.permissions = function (userId: mongoose.Schema.Types.ObjectId/***/): SocialProfilePermissionsInterface {
    return {
        canAdd: this.status === "NONE",
        canAccept: this.status === "PENDING" && this.addedBy.toString() !== userId.toString(),
        canUnblock: this.status === "BLOCKED" && this.blockedBy.toString() === userId.toString(),
        canUploadMedia: this.status === "ACTIVE" || this.status === "PENDING"
    }
}

export default mongoose.model<SocialProfileInterface>("SocialProfile", socialProfileSchema);
