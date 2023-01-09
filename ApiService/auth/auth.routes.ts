import {Router} from "express";
import {confirmLoginValidator, loginValidator, registerValidator} from "./auth.validator";
import {HTTPValidator, authCheck} from "../../shared";
import {confirmLogin, login, register} from "./auth.controller";

const router = Router()

router.post("/login", HTTPValidator(loginValidator), login);
router.post("/confirm-login", HTTPValidator(confirmLoginValidator), confirmLogin);
router.post("/register", HTTPValidator(registerValidator), register);
router.get("/check", authCheck, (_req, res) => res.sendStatus(200));

export default router;