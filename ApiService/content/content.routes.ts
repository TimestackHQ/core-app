import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import multer from "multer";
import {
    linkContent, unlinkContent,
} from "./content.controller";
import {linkContentValidator, unlinkContentValidator} from "./content.validator";
const upload = multer();

const router: Router = Router()

router.post("/:contentId/link", HTTPValidator(linkContentValidator, "body"), linkContent);
router.post("/:contentId/unlink", HTTPValidator(unlinkContentValidator, "body"), unlinkContent);

export default router;