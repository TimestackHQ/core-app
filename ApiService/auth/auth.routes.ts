import {Router} from "express";
import {
    confirmLoginValidator,
    loginValidator,
    notificationLinkValidator,
    registerValidator
} from "./auth.validator";
import {HTTPValidator, authCheck} from "../../shared";
import {abortDeleteAccount, confirmLogin, deleteAccount, login, notificationLink, register} from "./auth.controller";

const router: Router = Router()

router.post("/login", HTTPValidator(loginValidator), login);
router.post("/confirm-login", HTTPValidator(confirmLoginValidator), confirmLogin);
router.post("/register", HTTPValidator(registerValidator), register);
router.get("/check", authCheck, (req, res) => res.json(req.user));
router.post("/notifications/link", HTTPValidator(notificationLinkValidator), notificationLink);
router.post("/account/delete", authCheck, deleteAccount);
router.post("/account/delete/abort", authCheck, abortDeleteAccount);
export default router;