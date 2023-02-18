import {Router} from "express";
import {editProfileValidator} from "./profile.validator";
import {HTTPValidator} from "../../shared";
import {editProfile, get, picture} from "./profile.controller";
import * as multer from "multer";
const upload = multer();

const router: Router = Router()

router.get("/", get);
router.post("/", HTTPValidator(editProfileValidator), editProfile);
router.post("/picture", upload.single("file"), picture);

export default router;