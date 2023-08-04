import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import multer from "multer";
import {
    uploadCover,
    get,
    deleteMemories,
    viewMedia,
    createMedia
} from "./media.controller";
import { deleteMemoriesValidator, createMediaValidator } from "./media.validator";
const upload = multer();

const router: Router = Router()

router.post("/", authCheck, upload.single("mediaFile"), HTTPValidator(createMediaValidator, "query"), createMedia);
router.post("/cover", authCheck, upload.any(), uploadCover);
router.post("/:holderId/delete", authCheck, HTTPValidator(deleteMemoriesValidator), deleteMemories);
router.get("/:publicId", get);
router.get("/view/:mediaId/:holderId", authCheck, viewMedia);


export default router;