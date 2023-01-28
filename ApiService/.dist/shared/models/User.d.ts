import * as mongoose from "mongoose";
import { commonProperties } from "./utils";
export interface UserSchema extends mongoose.Document {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    isConfirmed: boolean;
    commonProperties: commonProperties;
    initSMSLogin: () => Promise<boolean>;
    checkSMSCode: (code: string) => Promise<boolean>;
    generateSessionToken: () => Promise<string>;
}
declare const _default: mongoose.Model<UserSchema, {}, {}, {}, any>;
export default _default;
