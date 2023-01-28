import * as mongoose from "mongoose";
import { commonProperties } from "./utils";
export interface AvailabilitySchema extends mongoose.Document {
    createdBy: mongoose.Types.ObjectId;
    users: mongoose.Types.ObjectId[];
    event: mongoose.Types.ObjectId;
    start: Date;
    end: Date;
    isRequired: boolean;
    commonProperties: commonProperties;
}
declare const _default: mongoose.Model<AvailabilitySchema, {}, {}, {}, any>;
export default _default;
