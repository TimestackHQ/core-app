import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import {MediaSchema} from "./Media";
import {UserSchema} from "./User";
import {isObjectIdOrHexString} from "mongoose";

export interface EventSchema extends mongoose.Document {
    name: string;
    startsAt: Date;
    endsAt: Date;
    location: string;
    media: MediaSchema[] & mongoose.Schema.Types.ObjectId[],
    createdBy: mongoose.Types.ObjectId;
    users: mongoose.Types.ObjectId[];
    invitees: mongoose.Types.ObjectId[];
    nonUsersInvitees: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
    }[];
    cover: MediaSchema & mongoose.Schema.Types.ObjectId;
    publicId: string;
    commonProperties: commonProperties;
    people: (userId: mongoose.Schema.Types.ObjectId) => (UserSchema & {type: String})[];
    // ics: (organizer: UserSchema, users: UserSchema[]) => Promise<any>;
}

const EventSchema = new mongoose.Schema({
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
    about: {
        type: String,
        required: false,
        max: 100000
    },
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media"
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    invitees: {
        type: [mongoose.Schema.Types.ObjectId],
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
        type: mongoose.Types.ObjectId,
        required: false,
        ref: "Media"
    },
    ...commonProperties,
});

EventSchema.methods.people = function (userId: mongoose.Schema.Types.ObjectId) {

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
        }).filter((user: any) => user._id.toString() !== userId.toString()),
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

// EventSchema.methods.ics = async function (organizer: UserSchema, users: UserSchema[]) {
//
//     return ics.createEvent({
//         title: this.name,
//         start: [this.start.getFullYear(), this.start.getMonth() + 1, this.start.getDate(), this.start.getHours(), this.start.getMinutes()],
//         duration: {
//             minutes: moment(this.end).diff(moment(this.start), "minutes"),
//             hours: moment(this.end).diff(moment(this.start), "hours")
//         },
//         status: "CONFIRMED",
//         organizer: {
//             name: organizer.firstName + " " + organizer.lastName,
//             email: organizer?.email
//         },
//         attendees: users.filter(user => user.email).map((user: UserSchema) => {
//             return {
//                 name: user.firstName + " " + user.lastName,
//                 email: user?.email,
//                 rsvp: false,
//             }
//         }),
//         busyStatus: "BUSY",
//     })
// }

export default mongoose.model<EventSchema>("Event", EventSchema);

