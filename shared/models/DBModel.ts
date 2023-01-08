import mongoose, {Model} from "mongoose";
import {UserSchema} from "./User";
import {AvailabilitySchema} from "./Availability";

export class DBModel<T> {

    public Model;

    constructor(Model: Model<T>) {
        this.Model = Model;
    }

    public async create(data: unknown): Promise<unknown> {
        return await this.Model.create(data);
    }

    public async find(query: unknown[]): Promise<unknown[]> {
        return this.Model.find(query);
    }

    public async findOne(query: unknown[]): Promise<unknown> {
        return this.Model.findOne(query);
    }

    public async findById(id: string): Promise<unknown> {
        return this.Model.findById(id);
    }

    public async updateOne(query: unknown[], data: unknown[]): Promise<unknown> {
        return this.Model.updateOne(query, data);
    }

    public async updateMany(query: unknown[], data: unknown[]): Promise<unknown> {
        return this.Model.updateMany(query, data);
    }

    public async deleteOne(query: unknown[]): Promise<unknown> {
        return this.Model.deleteOne(query);
    }

    public async deleteMany(query: unknown[]): Promise<unknown> {
        return this.Model.deleteMany(query);
    }

    public async count(query: unknown[]): Promise<unknown> {
        return this.Model.count(query);
    }

}

