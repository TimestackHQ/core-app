"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_validator_1 = require("./auth.validator");
const shared_1 = require("../../shared");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/login", (0, shared_1.HTTPValidator)(auth_validator_1.loginValidator), auth_controller_1.login);
router.post("/confirm-login", (0, shared_1.HTTPValidator)(auth_validator_1.confirmLoginValidator), auth_controller_1.confirmLogin);
router.post("/register", (0, shared_1.HTTPValidator)(auth_validator_1.registerValidator), auth_controller_1.register);
router.get("/check", shared_1.authCheck, (_req, res) => res.sendStatus(200));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map