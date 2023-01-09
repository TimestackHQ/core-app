"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonProperties = void 0;
const mongoose_1 = require("mongoose");
exports.commonProperties = {
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    events: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
        ref: "EventSourcing",
        select: false
    }
};
//# sourceMappingURL=utils.js.map