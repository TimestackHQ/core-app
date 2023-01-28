import {NextFunction, Request, Response} from "express";
import {Logger, Models, notifyOfEvent, notifyOfEventConfirmation} from "../../shared";
import {isObjectIdOrHexString} from "../../shared";
import moment = require("moment");
import * as _ from "lodash";

export async function createEvent (req: Request, res: Response, next: NextFunction) {

    try {

        // finds existing users
        const users = await Models.User.find({
            email: {
                $in: req.body.contacts
            }
        }).select("_id");


        const event = new Models.Event({
            name: req.body.name,
            createdBy: req.user._id,
            users: _.uniq([
                req.user._id.toString(), ...users.map((user: {_id: any}) => user._id.toString())
            ]),
            startsAt: req.body.startsAt,
            endsAt: req.body.endsAt,
            location: req.body.location,
        });

        await event.save();

        res.json({
            message: "Event created",
            event: {
                _id: event._id,
                name: event.name,
                link: `${process.env.FRONTEND_URL}/event/${event.publicId}`
            }
        });

    } catch (e) {
        next(e);
    }

}

export async function getAllEvents (req: Request, res: Response, next: NextFunction) {

    try {

        const events = await Models.Event.find({
            users: {
                $in: [req.user._id]
            }
        })
            .sort({createdAt: -1})
            .populate([{
                path: "users",
                select: "firstName lastName profilePictureSource"
            }])
            .lean();

        res.json({
            events
        });

    } catch (e) {
        next(e);
    }

}

export async function getEvent (req: Request, res: Response, next: NextFunction) {

    try {

        const event = await Models.Event.findOne({
            $or: [
                {
                    publicId: req.params.eventId
                },
                {
                    _id: isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : null
                }
            ],
            users: {
                $in: [req.user._id]
            }
        }).populate("users");

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        res.json({
            event
        })
    } catch (e) {
        next(e);
    }
}
