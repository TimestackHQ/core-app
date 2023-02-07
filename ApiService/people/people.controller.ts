import {NextFunction, Request, Response} from "express";
import {Logger, Models, notifyOfEvent, notifyOfEventConfirmation} from "../../shared";
import {isObjectIdOrHexString} from "../../shared";
import moment = require("moment");
import * as _ from "lodash";

export async function findPeople (req: Request, res: Response, next: NextFunction) {

    try {

        const people = await Models.User.find({$text: {$search: String(req.query.q)}}).limit(10).lean();

        res.json({
            people: people.filter(people => people?.username !== req.user.username).map((person: any) => ({
                _id: person._id,
                firstName: person.firstName,
                lastName: person.lastName,
                username: person.username,
                profilePictureSource: person.profilePictureSource,
            }))
        });


    } catch (e) {
        next(e);
    }

}