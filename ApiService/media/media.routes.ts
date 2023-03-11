import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import * as multer from "multer";
import {uploadCover, upload as uploadFile, get, getUploadedMedia, deleteMemories} from "./media.controller";
import {deleteMemoriesValidator, getUploadedMediaValidator} from "./media.validator";
const upload = multer();

const router: Router = Router()

router.post("/cover", authCheck, upload.single("cover"), uploadCover);
router.post("/:eventId", authCheck, upload.any(), uploadFile);
router.post("/:eventId/delete", authCheck, HTTPValidator(deleteMemoriesValidator), deleteMemories);
router.get("/:publicId", get);
router.get("/:eventId/new", authCheck, getUploadedMedia);

export default router;