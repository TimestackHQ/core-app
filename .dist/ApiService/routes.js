"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("./auth/auth.routes");
const events_routes_1 = require("./events/events.routes");
const shared_1 = require("../shared");
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/events", shared_1.authCheck, events_routes_1.default);
exports.default = router;
//# sourceMappingURL=routes.js.map