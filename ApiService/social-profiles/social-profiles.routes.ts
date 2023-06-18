import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import {
} from "./social-profiles.validator";
import {
    acceptProfile,
    addProfile,
    hasAccess,
    viewProfile
} from "./social-profiles.controller";

const router: Router = Router()

router.get("/user/:userId", viewProfile);
router.post("/user/:userId/add", addProfile);
router.post("/user/:userId/accept", acceptProfile);
router.get("/hasAccess", hasAccess);


export default router;