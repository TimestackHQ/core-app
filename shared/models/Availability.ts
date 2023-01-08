import * as mongoose from "mongoose";
import {commonProperties} from "./utils";

export interface AvailabilitySchema extends mongoose.Document {
    createdBy: mongoose.Types.ObjectId;
    users: mongoose.Types.ObjectId[];
    event: mongoose.Types.ObjectId;
    start: Date;
    end: Date;
    isRequired: boolean;
    commonProperties: commonProperties;

}
const AvailabilitySchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        select: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        select: false
    },

    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },

    isRequired: {
        type: Boolean,
        default: false,
        required: true,
        select: false
    },
    ...commonProperties,
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        select: false
    }
});

export default mongoose.model<AvailabilitySchema>("Availability", AvailabilitySchema);