import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import multer from "multer";
import {
    linkContent,
} from "./content.controller";
import {linkContentValidator} from "./content.validator";
const upload = multer();

const router: Router = Router()

router.post("/:contentId/link", HTTPValidator(linkContentValidator, "body"), linkContent);

export default router;