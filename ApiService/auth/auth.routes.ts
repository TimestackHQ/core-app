import {Router} from "express";
import {confirmLoginValidator, loginValidator, registerValidator} from "./auth.validator";
import {HTTPValidator, authCheck} from "../../shared";
import {confirmLogin, login, register} from "./auth.controller";

const router: Router = Router()

router.post("/login", HTTPValidator(loginValidator), login);
router.post("/confirm-login", HTTPValidator(confirmLoginValidator), confirmLogin);
router.post("/register", HTTPValidator(registerValidator), register);
router.get("/check", authCheck, (req, res) => res.json(req.user));

export default router;