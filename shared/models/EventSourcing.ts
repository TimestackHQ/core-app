import * as mongoose from "mongoose";

export interface EventSourcingSchema extends mongoose.Document {
    name: string;
    payload: any;
    createdAt: Date;
}

const EventSourcingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model<EventSourcingSchema>("EventSourcing", EventSourcingSchema);