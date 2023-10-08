import * as mongoose from "mongoose";
import { commonProperties } from "./utils";
import { v4 as uuid } from "uuid";
import { IUser } from "./User";
import { isObjectIdOrHexString } from "mongoose";
import { IMedia } from "../@types/Media";
import { ExtendedMongoSchema, UUIDProperty } from "./helpers";
import { IContent } from "./Content";

export interface IEvent extends mongoose.Document {
    name: string;
    startsAt: Date;
    endsAt?: Date;
    location?: string;
    about?: string;
    locationMapsPayload?: any;
    status: "public" | "private";
    revisits: number;
    revisitsCache: {
        [key: string]: Date
    }
    content: IContent[];
    createdBy: mongoose.Schema.Types.ObjectId/***/;
    users: mongoose.Schema.Types.ObjectId/***/[];
    invitees: mongoose.Schema.Types.ObjectId/***/[];
    nonUsersInvitees: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
    }[];
    cover: IMedia | mongoose.Schema.Types.ObjectId/***/;
    publicId: string;
    commonProperties: commonProperties;
    defaultPermission: "editor" | "viewer";
    exclusionList: mongoose.Schema.Types.ObjectId/***/[];
    mutedList: mongoose.Schema.Types.ObjectId/***/[];
    linkedEvents: mongoose.Schema.Types.ObjectId/***/[] | IEvent[];
    people: (userId: mongoose.Schema.Types.ObjectId/***/) => (IUser & { type: String })[];
    hasPermission: (userId: mongoose.Schema.Types.ObjectId/***/) => boolean;
    // ics: (organizer: UserSchema, users: UserSchema[]) => Promise<any>;
    permissions: (userId: mongoose.Schema.Types.ObjectId/***/) => {
        canUploadMedia: boolean;
    };

}

const EventSchema = new ExtendedMongoSchema({

    name: {
        type: String,
        required: true,
    },
    startsAt: {
        type: Date,
        required: true
    },
    endsAt: {
        type: Date,
        required: false
    },
    location: {
        type: String,
        required: false,
        max: 1000
    },
    locationMapsPayload: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
    },
    status: {
        type: String,
        required: true,
        default: "public",
    },
    about: {
        type: String,
        required: false,
        max: 100000
    },
    revisits: {
        type: Number,
        required: true,
        default: 0,
    },
    revisitsCache: {
        type: Object,
        required: true,
        default: {},
    },
    content: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Content"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User",
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId/***/],
        ref: "User",
    },
    invitees: {
        type: [mongoose.Schema.Types.ObjectId/***/],
        ref: "User",
    },
    nonUsersInvitees: [{
        email: {
            type: String,
            required: false,
        },
        phoneNumber: {
            type: String,
            required: false,
        },
        firstName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: false,
        }
    }],
    publicId: {
        type: String,
        required: true,
        default: uuid
    },
    cover: {
        type: mongoose.Schema.Types.ObjectId/***/,
        required: false,
        ref: "Media"
    },
    defaultPermission: {
        type: String,
        required: true,
        default: "editor",
        enum: ["viewer", "editor"],
    },
    exclusionList: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "User",
    }],
    mutedList: {
        type: [mongoose.Schema.Types.ObjectId/***/],
        ref: "User",
        default: []
    },

    linkedEvents: [{
        type: mongoose.Schema.Types.ObjectId/***/,
        ref: "Event",
    }],

    ...commonProperties,
});

EventSchema.methods.people = function (userId: mongoose.Schema.Types.ObjectId/***/) {

    return [
        ...this.users.map((user: any) => {
            if (isObjectIdOrHexString(user)) return {
                _id: isObjectIdOrHexString(user) ? user : user._id,
                status: "accepted"
            }
            return {
                ...user.toJSON(),
                status: "accepted"
            }
        }),//.filter((user: any) => user._id.toString() !== userId.toString()),
        ...this.invitees.map((user: any) => {
            if (isObjectIdOrHexString(user)) return {
                _id: isObjectIdOrHexString(user) ? user : user._id,
                status: "pending"
            }
            return {
                ...user.toJSON(),
                status: "pending"
            }
        }),
    ]
}

EventSchema.methods.hasPermission = function (userId: mongoose.Schema.Types.ObjectId/***/) {

    if (this.defaultPermission === "editor") return !this.exclusionList.map((u: any) => u.toString()).includes(userId.toString());
    else if (this.defaultPermission === "viewer") return this.exclusionList.map((u: any) => u.toString()).includes(userId.toString());
    else return false;

}

EventSchema.methods.permissions = function (userId: mongoose.Schema.Types.ObjectId/***/) {

    let canUploadMedia = false;
    if (this.defaultPermission === "editor") canUploadMedia = !this.exclusionList.map((u: any) => u.toString()).includes(userId.toString());
    else if (this.defaultPermission === "viewer") canUploadMedia = this.exclusionList.map((u: any) => u.toString()).includes(userId.toString());

    return {
        canUploadMedia,
    }

}

EventSchema.index({
    name: 'text',
    location: 'text'
});

export default mongoose.model<IEvent>("Event", EventSchema);

