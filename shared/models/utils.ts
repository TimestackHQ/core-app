import mongoose from "mongoose";

export type commonProperties = {
    createdAt: Date,
    events: mongoose.Types.ObjectId[],
}

export const commonProperties = {
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    events: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "EventSourcing",
        select: false
    }
}