import {Router} from "express";
import authRoutes from "./auth/auth.routes";
import eventsRoutes from "./events/events.routes";
import {authCheck} from "../shared";


const router = Router();

router.use("/auth", authRoutes);
router.use("/events", authCheck, eventsRoutes);

export default router;
