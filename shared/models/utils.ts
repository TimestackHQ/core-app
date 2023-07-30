import mongoose from "mongoose";

export type commonProperties = {
    createdAt: Date,
    events: mongoose.Schema.Types.ObjectId/***/[],
}

export const commonProperties = {
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    events: {
        type: [mongoose.Schema.Types.ObjectId/***/],
        default: [],
        required: true,
        ref: "EventSourcing",
        select: false
    }
}