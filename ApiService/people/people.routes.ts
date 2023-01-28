import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {createEventValidator} from "./people.validator";
import {createEvent, getAllEvents, getEvent} from "./people.controller";

const router = Router()

router.get("/", authCheck, getAllEvents);
router.get("/:eventId", authCheck, getEvent);
router.post("/", authCheck, HTTPValidator(createEventValidator), createEvent);

export default router;