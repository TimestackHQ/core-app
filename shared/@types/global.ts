import { Request } from "aws4";
import mongoose from "mongoose";

export type AWSS3ObjectType = Request;

export interface ExtendedMongoDocument extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId/***/
}