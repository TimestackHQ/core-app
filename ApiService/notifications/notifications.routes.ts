import {Router} from "express";
import {markAsReadValidator} from "./notifications.validator";
import {HTTPValidator} from "../../shared";
import {count, get, markAsRead} from "./notifications.controller";
import * as multer from "multer";

const router: Router = Router()

router.get("/", get);
router.get("/count", count);
router.post("/read", HTTPValidator(markAsReadValidator), markAsRead);

export default router;