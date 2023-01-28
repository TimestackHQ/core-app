import {NextFunction, Request, Response} from "express";
import {Logger, Models, notifyOfEvent, notifyOfEventConfirmation} from "../../shared";
import {isObjectIdOrHexString} from "../../shared";
import moment = require("moment");
import * as _ from "lodash";

export async function createEvent (req: Request, res: Response, next: NextFunction) {

    try {



    } catch (e) {
        next(e);
    }

}