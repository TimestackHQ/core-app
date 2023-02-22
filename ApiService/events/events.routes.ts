import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {createEventValidator, updatePeopleValidator} from "./events.validator";
import {createEvent, getAllEvents, getEvent, joinEvent, updatePeople} from "./events.controller";

const router: Router = Router()

router.get("/", authCheck, getAllEvents);
router.get("/:eventId", authCheck, getEvent);
router.post("/", authCheck, HTTPValidator(createEventValidator), createEvent);
router.put("/:eventId/people", authCheck, HTTPValidator(updatePeopleValidator), updatePeople);
router.post("/:eventId/join", authCheck, joinEvent);

export default router;