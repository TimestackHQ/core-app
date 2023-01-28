import * as mongoose from "mongoose";
import { commonProperties } from "./utils";
import { UserSchema } from "./User";
export interface EventSchema extends mongoose.Document {
    name: string;
    availabilities: mongoose.Types.ObjectId[];
    start: Date;
    end: Date;
    createdBy: mongoose.Types.ObjectId;
    users: mongoose.Types.ObjectId[];
    contacts: {
        anchor: string;
    }[];
    status: ("draft" | "pending" | "confirmed" | "cancelled");
    publicId: string;
    commonProperties: commonProperties;
    ics: (organizer: UserSchema, users: UserSchema[]) => Promise<any>;
}
declare const _default: mongoose.Model<EventSchema, {}, {}, {}, any>;
export default _default;
