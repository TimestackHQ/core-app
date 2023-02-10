import {Router} from "express";
import authRoutes from "./auth/auth.routes";
import eventsRoutes from "./events/events.routes";
import peopleRoutes from "./people/people.routes";
import mediaRoutes from "./media/media.routes";
import {authCheck} from "../shared";


const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/events", authCheck, eventsRoutes);
router.use("/people", authCheck, peopleRoutes);
router.use("/media", mediaRoutes);

export default router;
