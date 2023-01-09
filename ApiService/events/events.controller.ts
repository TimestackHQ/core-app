import {NextFunction, Request, Response} from "express";
import {Logger, Models, notifyOfEvent, notifyOfEventConfirmation} from "../../shared";
import {isObjectIdOrHexString} from "../../shared";
import moment = require("moment");
import * as _ from "lodash";

export async function createEvent (req: Request, res: Response, next: NextFunction) {

    try {

        // finds existing users
        const users = await Models.User.find({
            $or: [
                {
                    phoneNumber: {
                        $in: req.body.contacts.map((contact: {anchor: string}) => contact.anchor)
                    }
                },
                {
                    email: {
                        $in: req.body.contacts.map((contact: {anchor: string}) => contact.anchor)
                    }
                }
            ]
        }).select("_id");


        const event = new Models.Event({
            name: req.body.name,
            createdBy: req.user._id,
            users: _.uniq([
                req.user._id.toString(), ...users.map((user: {_id: any}) => user._id.toString())
            ])
        });

        await event.save();

        const availabilities = await Models.Availability.insertMany(req.body.availabilities.map((availability: any) => {
            return {
                ...availability,
                users: [
                    req.user._id
                ],
                createdBy: req.user._id,
                event: event._id,
                isRequired: true
            };
        }));

        event.availabilities = availabilities.map((availability: any) => availability._id);
        event.contacts = req.body.contacts.map((contact: {anchor: string}) => {
            return {
                anchor: contact.anchor
            }
        });

        await event.save();

        res.json({
            message: "Event created",
            event: {
                name: event.name,
                link: `${process.env.FRONTEND_URL}/event/${event.publicId}`
            }
        });

        /// TODO : create queue for notifications
        for (const contact of event.contacts) await notifyOfEvent(event, req.user, contact.anchor);

    } catch (e) {
        next(e);
    }

}

export async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        const events = await Models.Event.find({
            status: ["pending", "confirmed"],
            users: {
                $in: [req.user._id]
            }
        }).populate({
            path: "availabilities",
            select: "users"
        }).sort({createdAt: -1}).lean();

        res.json(events.map((event: any) => {
            let users = [];
            for (const availability of event.availabilities) {
                for (const user of availability.users) {
                    users.push(user.toString());
                }
            }
            users = _.uniq(users);
            return {
                ...event,
                respondedUsersCount: users.length,
                totalUsersCount: event.users.length
            }
        }))

    } catch (err) {
        Logger(err);
        next(err);
    }
}

export async function getOne (req: Request, res: Response, next: NextFunction) {
    try {

        const userSelect = "firstName lastName";
        const event = await Models.Event.findOne({
            $or: [
                {
                    publicId: req.params.eventId
                },
                {
                    _id:  isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : undefined
                }
            ]
        })
            .populate([{
                path: "availabilities",
            }, {
                path: "createdBy",
                select: userSelect
            }, {
                path: "users",
                select: userSelect
            }]).lean();

        if (!event) return res.sendStatus(404);

        res.json({
            ...event,
            availabilities: event.availabilities.map((availability: any) => ({
                ...availability,
                selected: !!availability.users.find((user: any) => String(user) === String(req.user._id))
            }))
        });

    } catch (err) {
        Logger(err);
        next(err);
    }
}

export async function respond (req: Request, res: Response, next: NextFunction) {
    try {
        const event = await Models.Event.findOne({
            _id: req.params.eventId,
            // status: "pending",
            users: {
                $in: [req.user._id]
            }
        });

        if (!event) return res.sendStatus(404);

        if (req.body.newAvailabilities.length !== 0) {
            const existingAvailabilities = await Models.Availability.find({
                event: event._id,
                $or: req.body.newAvailabilities.map((availability: any) => {
                    return {
                        start: availability.start,
                        end: availability.end
                    }
                })
            });

            req.body.newAvailabilities = req.body.newAvailabilities.filter((availability: any) => {
                return !existingAvailabilities.find((existingAvailability: any) => {
                    console.log(moment(existingAvailability.start).toDate() === moment(availability.start).toDate());

                    return String(moment(existingAvailability.start).toDate())
                            === String(moment(availability.start).toDate())
                        && String(moment(existingAvailability.end).toDate())
                            === String(moment(availability.end).toDate());
                });
            });

            console.log(req.body.newAvailabilities);

        }


        const newAvailabilities = await Models.Availability.insertMany(req.body.newAvailabilities.map((availability: any) => {
            console.log({
                ...availability,
                users: [
                    req.user._id
                ],
                createdBy: req.user._id,
                event: event._id,
                isRequired: true
            })
            return {
                ...availability,
                users: [
                    req.user._id
                ],
                createdBy: req.user._id,
                event: event._id,
                isRequired: true
            };
        }));

        console.log(newAvailabilities);

        // selects existing availabilities
        await Models.Availability.updateMany({
            _id: {
                $in: req.body.selectedAvailabilities
            },
            users: {
                $nin: [req.user._id]
            },
            event: event._id
        }, {
            $push: {
                users: req.user._id
            }
        });

        // unselects existing availabilities
        await Models.Availability.updateMany({
            _id: {
                $nin: req.body.selectedAvailabilities
            },
            users: {
                $in: [req.user._id]
            },
            event: event._id
        }, {
            $pull: {
                users: req.user._id
            }
        });

        // adds new availabilities and new contacts to event
        event.availabilities = [...event.availabilities, ...newAvailabilities.map((availability: any) => availability._id)];
        event.contacts = [...event.contacts, ...req.body.contacts.map((contact: { anchor: string }) => {
            return {
                anchor: contact.anchor
            }
        })];

        const users = await Models.User.find({
            $or: [
                {
                    email: {
                        $in: req.body.contacts.map((contact: { anchor: string }) => contact.anchor)
                    }
                },
                {
                    phone: {
                        $in: req.body.contacts.map((contact: { anchor: string }) => contact.anchor)
                    }
                }
            ],
        }).select("_id");

        event.users = [
            ...event.users,
            ...users
                .filter(
                    (user: any) => !event.users.find((eventUser: any) => String(eventUser) === String(user._id))
                )
                .map((user: any) => user._id)
        ];

        await event.save();

        res.json({
            message: "Response processed",
            event: {
                name: event.name,
                link: `${process.env.FRONTEND_URL}/event/${event.publicId}`,
            }
        });

        /// TODO : create queue for notifications
        for (const contact of req.body.contacts) await notifyOfEvent(event, req.user, contact.anchor);


    } catch (err) {
        Logger(err);
        next(err);
    }
}

export async function confirm (req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.params.eventId);
        const event = await Models.Event.findOne({
            _id: req.params.eventId,
            // status: "pending",
            createdBy: req.user._id
        }).populate({
            path: "users",
            select: "firstName lastName email phoneNumber"
        });

        if (!event) return res.sendStatus(404);

        event.start = req.body.start;
        event.end = req.body.end;
        event.status = "confirmed";
        await event.save();

        // @ts-ignore
        const ics = await event.ics(req.user, event.users)

        for (const userRaw of event.users) {
            // @ts-ignore
            let user: {email: string, phoneNumber:string} = userRaw;
            if(user.email) await notifyOfEventConfirmation(event, req.user, user.email, `${process.env.FRONTEND_URL}/event/${event.publicId}`, ics.value);
        }

        return res.sendStatus(200);


    } catch (err) {
        Logger(err);
        next(err);
    }
}