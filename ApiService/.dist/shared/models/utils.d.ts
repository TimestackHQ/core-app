import mongoose from "mongoose";
export declare type commonProperties = {
    createdAt: Date;
    events: mongoose.Types.ObjectId[];
};
export declare const commonProperties: {
    createdAt: {
        type: DateConstructor;
        default: () => number;
        required: boolean;
    };
    events: {
        type: (typeof mongoose.Schema.Types.ObjectId)[];
        default: never[];
        ref: string;
        select: boolean;
    };
};
