"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const utils_1 = require("./utils");
const AvailabilitySchema = new mongoose.Schema(Object.assign(Object.assign({ createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        select: false
    }, users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }], event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        select: false
    }, start: {
        type: Date,
        required: true
    }, end: {
        type: Date,
        required: true
    }, isRequired: {
        type: Boolean,
        default: false,
        required: true,
        select: false
    } }, utils_1.commonProperties), { createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        select: false
    } }));
exports.default = mongoose.model("Availability", AvailabilitySchema);
//# sourceMappingURL=Availability.js.map