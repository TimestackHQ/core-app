import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {findPeople} from "./people.controller";

const router: Router = Router()

router.get("/", authCheck, findPeople);

export default router;