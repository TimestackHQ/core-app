import {NextFunction, Request, Response} from "express";
import {Models} from "../../shared";
import {isObjectIdOrHexString} from "../../shared";
import * as _ from "lodash";

export async function createEvent (req: Request, res: Response, next: NextFunction) {

    try {

        // finds existing users
        const users = await Models.User.find({
            _id: {
                $in: req.body.invitees.filter((i: any) => isObjectIdOrHexString(i._id)).map((invitee: any) => invitee._id)
            }
        }).select("_id");

        const cover = await Models.Media.findOne({
            publicId: req.body.cover
        });

        if(!cover) return res.sendStatus(404);

        const event = new Models.Event({
            name: req.body.name,
            createdBy: req.user._id,
            invitees: _.uniq([
                req.user._id.toString(),
                ...users.map((user: {_id: any}) => user._id.toString())
            ]),
            nonUsersInvitees: req.body.invitees
                .filter((invitee: any) => !isObjectIdOrHexString(invitee?._id))
                .map((invitee: { phoneNumber: any; email: any; firstName: any; lastName: any; }) => ({
                    phoneNumber: invitee?.phoneNumber,
                    email: invitee?.email,
                    firstName: invitee?.firstName,
                    lastName: invitee?.lastName

                 }))
                .filter((invitee: {}) => Object.keys(invitee).length > 0),
            startsAt: req.body.startsAt,
            endsAt: req.body.endsAt,
            location: req.body.location,
            cover: cover._id,
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
        console.log(e)
        next(e);
    }

}

export async function getAllEvents (req: Request, res: Response, next: NextFunction) {

    try {

        const events = await Models.Event.find({
            $or: [{
                users: {
                    $in: [req.user._id]
                }
            }, {
                createdBy: req.user._id
            }],
        })
            .sort({createdAt: -1})
            .select("-media")
            .populate([{
                path: "users",
                select: "firstName lastName profilePictureSource"
            }, {
                path: "cover",
                select: "publicId"
            }])
            .lean();

        res.json({
            events: events.map(event => {
                return {
                    ...event,
                    cover: event.cover?.publicId
                }
            })
        });

    } catch (e) {
        next(e);
    }

}

export async function getEvent (req: Request, res: Response, next: NextFunction) {

    try {

        const event = await Models.Event.findOne({
            $and: [{
                $or: [
                    {
                        publicId: req.params.eventId
                    },
                    {
                        _id: isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : null
                    }
                ]},
                {
                    $or: [{
                    users: {
                        $in: [req.user._id]
                    }
                }, {
                    createdBy: req.user._id
                }],
            }]
        }).populate([{
            path: "media",
            select: "-_id publicId",
            options: {
                sort: {
                    createdAt: -1
                }
            }
        }, {
            path: "cover",
            select: "publicId"
        },{
            path: "users",
            select: "firstName lastName profilePictureSource"
        }, {
            path: "invitees",
            select: "firstName lastName profilePictureSource"
        },{
            path: "nonUsersInvitees",
            select: "firstName lastName profilePictureSource"
        }]).lean();

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        res.json({
            event: {
                ...event,
                media: event.media.map(file => file?.publicId),
                cover: event.cover?.publicId,
                peopleCount : event.users.length + event.invitees.length + event.nonUsersInvitees.length,
                mediaCount: event.media.length,
                users: undefined,
                invitees: undefined,
                nonUsersInvitees: undefined,
                people: [
                    ...event.users.map(user => {
                        return {
                            ...user,
                            status: "accepted"
                        }
                    }),
                    ...event.invitees.map(user => {
                        return {
                            ...user,
                            status: "pending"
                        }
                    }),
                    ...event.nonUsersInvitees.map(user => {
                        return {
                            ...user,
                            status: "notUser"
                        }
                    })
                ]
            }
        })
    } catch (e) {
        next(e);
    }
}
