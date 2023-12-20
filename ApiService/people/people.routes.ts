import {Router} from "express";
import {HTTPValidator, authCheck} from "../../shared";
import {findPeople, future, getMutuals} from "./people.controller";
import {getMutualsQueryValidator, getPeopleQueryValidator} from "./people.validator";

const router: Router = Router()

router.get("/", authCheck, HTTPValidator(getPeopleQueryValidator, "query"), findPeople);
router.get("/future", authCheck, future);
router.get("/:targetUserId/mutuals", HTTPValidator(getMutualsQueryValidator, "query"), getMutuals);

export default router;