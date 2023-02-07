import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import * as multer from "multer";
import {uploadCover, upload as uploadFile, get} from "./media.controller";
const upload = multer();

const router: Router = Router()

router.post("/cover", authCheck, upload.single("cover"), uploadCover);
router.post("/:eventId", authCheck, upload.single("file"), uploadFile);
router.get("/:publicId", get);

export default router;