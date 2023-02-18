import {Router} from "express";
import {confirmLoginValidator, loginValidator, registerValidator} from "./auth.validator";
import {HTTPValidator, authCheck} from "../../shared";
import {confirmLogin, login, register} from "./auth.controller";

const router: Router = Router()

router.post("/login", HTTPValidator(loginValidator), login);

export default router;