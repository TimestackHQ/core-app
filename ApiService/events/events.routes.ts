import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {
    createEventValidator,
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
    updatePeople, leaveEvent, updatePermissions, getPeople
} from "./events.controller";

const router: Router = Router()

router.get("/", authCheck, getAllEvents);
router.get("/invites", authCheck, getAllInvites);
router.get("/:eventId", authCheck, getEvent);
router.put("/:eventId", authCheck, HTTPValidator(updateEventValidator), updateEvent);
router.post("/:eventId/leave", authCheck, leaveEvent);
router.get("/:eventId/media", authCheck, mediaList);
router.post("/", authCheck, HTTPValidator(createEventValidator), createEvent);
router.get("/:eventId/people", authCheck, getPeople);
router.put("/:eventId/people", authCheck, HTTPValidator(updatePeopleValidator), updatePeople);
router.put("/:eventId/people/:userId/permission", authCheck, HTTPValidator(updatePermissionValidator), updatePermissions);
router.post("/:eventId/join", authCheck, joinEvent);
router.get("/:eventId/media/byme", authCheck, byMe);


export default router;