import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {confirmValidator, createEventValidator, respondValidator} from "./events.validator";
import {confirm, createEvent, getAll, getOne, respond} from "./events.controller";

const router = Router()

router.get("/", getAll);
router.get("/:eventId", getOne);
router.post("/:eventId/respond", HTTPValidator(respondValidator), respond);
router.post("/:eventId/confirm", HTTPValidator(confirmValidator), confirm);
router.post("/", HTTPValidator(createEventValidator), createEvent);

export default router;