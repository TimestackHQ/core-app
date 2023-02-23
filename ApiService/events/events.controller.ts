import {NextFunction, Request, Response} from "express";
import {inviteToEvent, Models} from "../../shared";
import {UserSchema} from "../../shared/models/User";
import {isObjectIdOrHexString} from "../../shared";
import * as _ from "lodash";
import {getBuffer, standardEventPopulation} from "./events.tools";

export async function createEvent (req: Request, res: Response, next: NextFunction) {

    try {

        // finds existing users
        const users = await Models.User.find({
            _id: {
                $in: req.body.invitees
            }
        });

        const cover = await Models.Media.findOne({
            publicId: req.body.cover
        });

        if(!cover) return res.sendStatus(404);

        const event = new Models.Event({
            name: req.body.name,
            createdBy: req.user._id,
            invitees: _.uniq([
                ...users.map((user: {_id: any}) => user._id.toString())
            ]),
            startsAt: req.body.startsAt,
            endsAt: req.body.endsAt,
            location: req.body.location,
            cover: cover._id,
            users: [req.user._id],
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

        // await Promise.all([
        //     ...users.map(async (user: UserSchema) => {
        //         await inviteToEvent(event, req.user, user);
        //     }),
        //     ...event.nonUsersInvitees.map(async (invitee) => {
        //         await inviteToEvent(event, req.user, {
        //             firstName: invitee.firstName,
        //             lastName: invitee.lastName,
        //             phoneNumber: String(invitee.phoneNumber),
        //             email: invitee.email,
        //         });
        //     }
        // )]);

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
            .populate(standardEventPopulation)
            .select("-media")

        res.json({
            events: await Promise.all(events.map(async (event, i) => {
                let buffer = undefined;
                if(i < 4) {
                    buffer = await getBuffer(event);
                }
                return {
                    ...event.toJSON(),
                    cover: event.cover?.publicId,
                    peopleCount : event.users?.length + event.invitees?.length + event.nonUsersInvitees?.length,
                    // mediaCount: event.media.length,
                    users: undefined,
                    invitees: undefined,
                    nonUsersInvitees: undefined,
                    media: undefined,
                    people: event.people(req.user._id),
                    buffer
                }
            }))
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
                ]}
            ],
        }).populate([
            {
                path: "media",
                select: "-_id publicId",
                options: {
                    sort: {
                        createdAt: -1
                    }
                }
            },
            ...standardEventPopulation
        ]);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        const buffer = await getBuffer(event);

        if (!event.users?.map(u => u._id.toString()).includes(req.user._id.toString())) return res.status(200).json({
            message: "joinRequired",
            event: {
                _id: event._id,
                publicId: event.publicId,
                name: event.name,
                location: event.location,
                startsAt: event.startsAt,
                endsAt: event?.endsAt,
                cover: event.cover?.publicId,
                people: (await Models.User.find({
                    _id: {
                        $in: event.users
                    }
                }).select("profilePictureSource")).map((user: any) => user?.profilePictureSource),
                buffer
            }

        })

        // get cover buffer from google cloud

        res.json({
            event: {
                ...event.toJSON(),
                media: event.media.map(file => file?.publicId),
                cover: event.cover?.publicId,
                peopleCount : event.users.length + event.invitees.length + event.nonUsersInvitees.length,
                mediaCount: event.media.length,
                users: undefined,
                invitees: undefined,
                nonUsersInvitees: undefined,
                buffer,
                people: event.people(req.user._id)
            }
        })
    } catch (e) {
        next(e);
    }
}

export const updatePeople = async (req: any, res: any, next: any) => {
    try {

        req.body.add = req.body.add.filter((id: string) => isObjectIdOrHexString(id));
        req.body.remove = req.body.remove.filter((id: string) => isObjectIdOrHexString(id));
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
                $in: [req.user._id],
            },
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        if(req.body.add.length) {
            const usersToAdd = await Models.User.find({
                _id: {
                    $in: req.body.add,
                    $nin: event.users,
                    $ne: req.user._id
                }
            }).select("_id");
            event.invitees = _.uniq([
                ...event.invitees.map(id => id.toString()),
                ...usersToAdd.map((user: any) => user._id.toString())
            ]);
        }


        if(req.body.remove.length) {
            const usersToRemove = await Models.User.find({
                _id: {
                    $in: req.body.remove,
                    $ne: req.user._id
                }
            }).select("_id");
            event.users = event.users.filter((user: any) => !usersToRemove.map((user: any) => user._id.toString()).includes(user._id.toString()));
            event.invitees = event.invitees.filter((user: any) => !usersToRemove.map((user: any) => user._id.toString()).includes(user._id.toString()));
        }

        await event.save();

        return res.json({
            people: event.people(req.user._id)
        });


    } catch (e) {
        next(e);
    }
}

export const joinEvent = async (req: any, res: any, next: any) => {
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
                $nin: [req.user._id],
            }
        });

        if (!event) {
            return res.sendStatus(200);
        }

        event.users.push(req.user._id);
        await event.save();

        return res.sendStatus(200);

    } catch (e) {
        next(e);
    }
}