import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import * as multer from "multer";
import { uploadCover, upload as uploadFile, get, getUploadedMedia, deleteMemories, viewMedia } from "./media.controller";
import { deleteMemoriesValidator, getUploadedMediaValidator } from "./media.validator";
const upload = multer();

const router: Router = Router()

router.post("/cover", authCheck, upload.any(), uploadCover);
router.post("/:holderId", authCheck, upload.any(), uploadFile);
router.post("/:holderId/delete", authCheck, HTTPValidator(deleteMemoriesValidator), deleteMemories);
router.get("/:publicId", get);
router.get("/view/:mediaId/:holderId", authCheck, viewMedia);
router.get("/:eventId/new", authCheck, getUploadedMedia);

export default router;