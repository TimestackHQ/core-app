"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
const ics = require("ics");
const moment = require("moment");
const eventStatus = ["draft", "pending", "confirmed", "cancelled"];
const EventSchema = new mongoose.Schema(Object.assign({ name: {
        type: String,
        required: true,
    }, availabilities: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Availability",
    }, start: {
        type: Date,
        required: false
    }, end: {
        type: Date,
        required: false
    }, createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    }, contacts: [new mongoose.Schema({
            anchor: {
                type: String,
                required: true,
            }
        })], status: {
        type: String,
        default: "pending",
        required: true,
        enum: eventStatus,
    }, publicId: {
        type: String,
        required: true,
        unique: true,
        default: uuid_1.v4
    } }, utils_1.commonProperties));
EventSchema.methods.ics = function (organizer, users) {
    return __awaiter(this, void 0, void 0, function* () {
        return ics.createEvent({
            title: this.name,
            start: [this.start.getFullYear(), this.start.getMonth() + 1, this.start.getDate(), this.start.getHours(), this.start.getMinutes()],
            duration: {
                minutes: moment(this.end).diff(moment(this.start), "minutes"),
                hours: moment(this.end).diff(moment(this.start), "hours")
            },
            status: "CONFIRMED",
            organizer: {
                name: organizer.firstName + " " + organizer.lastName,
                email: organizer === null || organizer === void 0 ? void 0 : organizer.email
            },
            attendees: users.filter(user => user.email).map((user) => {
                return {
                    name: user.firstName + " " + user.lastName,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    rsvp: false,
                };
            }),
            busyStatus: "BUSY",
        });
    });
};
exports.default = mongoose.model("Event", EventSchema);
//# sourceMappingURL=Event.js.map