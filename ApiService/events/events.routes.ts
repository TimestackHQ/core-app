import { Router } from "express";
import { HTTPValidator, authCheck } from "../../shared";
import {
    createEventValidator,
    linkEventValidator,
    updateEventValidator,
    updatePeopleValidator,
    updatePermissionValidator
} from "./events.validator";
import {
    byMe,
    createEvent,
    updateEvent,
    getAllEvents,
    getAllInvites,
    getEvent,
    joinEvent,
    mediaList,
    updatePeople, leaveEvent, updatePermissions, getPeople, muteEvent, getLinkedEvents, linkEvent, getMutualEvents
} from "./events.controller";

const router: Router = Router()

router.get("/", authCheck, getAllEvents);
router.get("/mutual/user/:userId", authCheck, getMutualEvents);
router.get("/invites", authCheck, getAllInvites);
router.get("/:eventId", authCheck, getEvent);
router.get("/:eventId/linked-events", authCheck, getLinkedEvents);
router.put("/:eventId", authCheck, HTTPValidator(updateEventValidator), updateEvent);
router.post("/:eventId/leave", authCheck, leaveEvent);
router.get("/:eventId/media", authCheck, mediaList);
router.post("/", authCheck, HTTPValidator(createEventValidator), createEvent);
router.get("/:eventId/people", authCheck, getPeople);
router.put("/:eventId/people", authCheck, HTTPValidator(updatePeopleValidator), updatePeople);
router.put("/:eventId/people/:userId/permission", authCheck, HTTPValidator(updatePermissionValidator), updatePermissions);
router.post("/:eventId/join", authCheck, joinEvent);
router.get("/:eventId/media/byme", authCheck, byMe);
router.post("/:eventId/mute", authCheck, muteEvent);
router.post("/:eventId/link-event/:targetEventId", HTTPValidator(linkEventValidator), authCheck, linkEvent);


export default router;