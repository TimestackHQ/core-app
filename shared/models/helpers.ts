import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";
export function UUIDGenerator() {
    return uuidv4();
}

export const UUIDProperty = {
    type: String,
    required: true,
    default: () => uuidv4()
}

export class ExtendedMongoSchema extends mongoose.Schema {
    constructor(definition: mongoose.SchemaDefinition, options?: mongoose.SchemaOptions) {
        super(definition, options);
    }

}