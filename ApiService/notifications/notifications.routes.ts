import {Router} from "express";
import {} from "./notifications.validator";
import {HTTPValidator} from "../../shared";
import {get} from "./notifications.controller";
import * as multer from "multer";

const router: Router = Router()

router.get("/", get);

export default router;