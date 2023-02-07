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
            .populate([{
                path: "users",
                select: "firstName lastName profilePictureSource"
            }, {
                path: "cover",
                select: "thumbnail"
            }])
            .lean();

        res.json({
            events: events.map(event => {
                return {
                    ...event,
                    cover: event.cover.thumbnail
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
            path: "users"
        }, {
            path: "media",
            select: "-_id publicId",
        }, {
            path: "cover",
            select: "thumbnail"
        }]).lean();

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        res.json({
            event: {
                ...event,
                media: event.media.map(file => file.publicId),
                cover: event.cover.thumbnail
            }
        })
    } catch (e) {
        next(e);
    }
}
