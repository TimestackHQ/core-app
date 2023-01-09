import * as mongoose from "mongoose";
export interface EventSourcingSchema extends mongoose.Document {
    name: string;
    payload: any;
    createdAt: Date;
}
declare const _default: mongoose.Model<EventSourcingSchema, {}, {}, {}, any>;
export default _default;
