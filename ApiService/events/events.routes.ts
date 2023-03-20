import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {createEventValidator, updateEventValidator, updatePeopleValidator} from "./events.validator";
import {
    byMe,
    createEvent,
    updateEvent,
    getAllEvents,
    getAllInvites,
    getEvent,
    joinEvent,
    mediaList,
    updatePeople
} from "./events.controller";

const router: Router = Router()

router.get("/", authCheck, getAllEvents);
router.get("/invites", authCheck, getAllInvites);
router.get("/:eventId", authCheck, getEvent);
router.put("/:eventId", authCheck, HTTPValidator(updateEventValidator), updateEvent);
router.get("/:eventId/media", authCheck, mediaList);
router.post("/", authCheck, HTTPValidator(createEventValidator), createEvent);
router.put("/:eventId/people", authCheck, HTTPValidator(updatePeopleValidator), updatePeople);
router.post("/:eventId/join", authCheck, joinEvent);
router.get("/:eventId/media/byme", authCheck, byMe);


export default router;