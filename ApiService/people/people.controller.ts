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

export async function future(req: Request, res: Response, next: NextFunction) {

    try {

        const eventsCount = await Models.Event.countDocuments({
            users: {
                $in: [req.user._id]
            }
        });
        const events = await Models.Event.find({
            users: {
                $in: [req.user._id]
            }
        })
            .populate({
                path: "users",
                select: "firstName lastName username profilePictureSource",
                match: {
                    _id: {
                        $ne: req.user._id
                    }
                },
                options: {
                    limit: 10
                }
            })
            .limit(50)
            .sort({createdAt: -1});

        const people = {};

        events.forEach(event => {
            event.users.forEach(user => {
                // @ts-ignore
                if (people[String(user._id.toString())] === undefined) {
                    // @ts-ignore
                    people[user._id.toString()] = {
                        // @ts-ignore
                        ...user.toJSON(),
                        eventsCount: 1
                    };
                } else {
                    // @ts-ignore
                    people[user._id.toString()].eventsCount++;
                }
            });
        })

        return res.json({
            eventsCount,
            // @ts-ignore
            people: Object.values(people).sort((a, b) => b.eventsCount - a.eventsCount)
        });

    } catch (e) {

    }
}
