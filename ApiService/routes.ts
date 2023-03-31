import {Router} from "express";
import authRoutes from "./auth/auth.routes";
import eventsRoutes from "./events/events.routes";
import peopleRoutes from "./people/people.routes";
import mediaRoutes from "./media/media.routes";
import profileRoutes from "./profile/profile.routes";
import notificationsRoutes from "./notifications/notifications.routes";
import {authCheck} from "../shared";


const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventsRoutes);
router.use("/people", authCheck, peopleRoutes);
router.use("/media", mediaRoutes);
router.use("/profile", authCheck, profileRoutes);
router.use("/notifications", authCheck, notificationsRoutes);

export default router;













1
1
1
1
1
1
1
1
1
11



















