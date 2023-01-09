import * as mongoose from "mongoose";
import {commonProperties} from "./utils";
import {v4 as uuid} from "uuid";
import * as ics from 'ics';
import moment = require("moment");
import {UserSchema} from "./User";

const eventStatus = ["draft", "pending", "confirmed", "cancelled"]

export interface EventSchema extends mongoose.Document {
    name: string;
    availabilities: mongoose.Types.ObjectId[];
    start: Date;
    end: Date;
    createdBy: mongoose.Types.ObjectId;
    users: mongoose.Types.ObjectId[];
    contacts: {
        anchor: string
    }[];
    status: ("draft" | "pending" | "confirmed" | "cancelled");
    publicId: string;
    commonProperties: commonProperties;
    ics: (organizer: UserSchema, users: UserSchema[]) => Promise<any>;
}

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    availabilities: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Availability",
    },
    start: {
        type: Date,
        required: false
    },
    end: {
        type: Date,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    },
    contacts: [new mongoose.Schema({
        anchor: {
            type: String,
            required: true,
        }
    })],
    status: {
        type: String,
        default: "pending",
        required: true,
        enum: eventStatus,
    },
    publicId: {
        type: String,
        required: true,
        unique: true,
        default: uuid
    },
    ...commonProperties,
});

EventSchema.methods.ics = async function (organizer: UserSchema, users: UserSchema[]) {

    return ics.createEvent({
        title: this.name,
        start: [this.start.getFullYear(), this.start.getMonth() + 1, this.start.getDate(), this.start.getHours(), this.start.getMinutes()],
        duration: {
            minutes: moment(this.end).diff(moment(this.start), "minutes"),
            hours: moment(this.end).diff(moment(this.start), "hours")
        },
        status: "CONFIRMED",
        organizer: {
            name: organizer.firstName + " " + organizer.lastName,
            email: organizer?.email
        },
        attendees: users.filter(user => user.email).map((user: UserSchema) => {
            return {
                name: user.firstName + " " + user.lastName,
                email: user?.email,
                rsvp: false,
            }
        }),
        busyStatus: "BUSY",
    })
}

export default mongoose.model<EventSchema>("Event", EventSchema);

