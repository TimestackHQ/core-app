import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import {
} from "./social-profiles.validator";
import {
    acceptProfile,
    addProfile,
    declineProfile,
    get,
    hasAccess,
    mediaList,
    viewProfile
} from "./social-profiles.controller";

const router: Router = Router()

router.get("/", get)
router.get("/user/:userId", viewProfile);
router.post("/user/:userId/add", addProfile);
router.post("/user/:userId/accept", acceptProfile);
router.post("/user/:userId/decline", declineProfile);
router.get("/hasAccess", hasAccess);
router.get("/:profileId/media", mediaList)


export default router;