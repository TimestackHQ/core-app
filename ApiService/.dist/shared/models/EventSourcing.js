"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const EventSourcingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
exports.default = mongoose.model("EventSourcing", EventSourcingSchema);
//# sourceMappingURL=EventSourcing.js.map