import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {findPeople, future} from "./people.controller";

const router: Router = Router()

router.get("/", authCheck, findPeople);
router.get("/future", authCheck, future);

export default router;