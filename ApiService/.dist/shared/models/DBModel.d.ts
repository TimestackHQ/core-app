import mongoose, { Model } from "mongoose";
export declare class DBModel<T> {
    Model: mongoose.Model<T, {}, {}, {}, any>;
    constructor(Model: Model<T>);
    create(data: unknown): Promise<unknown>;
    find(query: unknown[]): Promise<unknown[]>;
    findOne(query: unknown[]): Promise<unknown>;
    findById(id: string): Promise<unknown>;
    updateOne(query: unknown[], data: unknown[]): Promise<unknown>;
    updateMany(query: unknown[], data: unknown[]): Promise<unknown>;
    deleteOne(query: unknown[]): Promise<unknown>;
    deleteMany(query: unknown[]): Promise<unknown>;
    count(query: unknown[]): Promise<unknown>;
}
