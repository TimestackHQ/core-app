import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import {MediaSchema} from "./Media";

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
    // ics: (organizer: UserSchema, users: UserSchema[]) => Promise<any>;
}

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    startsAt: {
        type: Date,
        required: false
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

