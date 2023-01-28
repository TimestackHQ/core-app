"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("../../shared");
const events_validator_1 = require("./events.validator");
const events_controller_1 = require("./events.controller");
const router = (0, express_1.Router)();
router.get("/", events_controller_1.getAll);
router.get("/:eventId", events_controller_1.getOne);
router.post("/:eventId/respond", (0, shared_1.HTTPValidator)(events_validator_1.respondValidator), events_controller_1.respond);
router.post("/:eventId/confirm", (0, shared_1.HTTPValidator)(events_validator_1.confirmValidator), events_controller_1.confirm);
router.post("/", (0, shared_1.HTTPValidator)(events_validator_1.createEventValidator), events_controller_1.createEvent);
exports.default = router;
//# sourceMappingURL=events.routes.js.map