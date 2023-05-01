import { NextFunction, Request, Response } from "express";
import { GCP, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import { getBuffer, standardEventPopulation } from "./events.tools";
import { ObjectId } from "bson";
import moment = require("moment");

export async function createEvent(req: Request, res: Response, next: NextFunction) {

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

        const event = new Models.Event({
            name: req.body.name,
            createdBy: req.user._id,
            invitees: _.uniq([
                ...users.map((user: { _id: any }) => user._id.toString())
            ]),
            startsAt: req.body.startsAt,
            endsAt: req.body?.endsAt,
            about: req.body?.about,
            location: req.body?.location,
            locationMapsPayload: req.body?.locationMapsPayload,
            cover: cover?._id,
            users: [req.user._id],
            defaultPermission: req.body?.defaultPermission,
            exclusionList: req.body.defaultPermission === "viewer" ? [req.user._id] : [],
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

        // @ts-ignore
        await Promise.all(
            [...event.invitees].map(async (invitee: any) => {
                const notification = new Models.Notification({
                    user: invitee,
                    title: "New invite",
                    body: `${req.user.firstName} has invited you to ${event.name}`,
                    data: {
                        type: "eventInvite",
                        payload: {
                            eventId: event,
                            userName: req.user.firstName,
                            eventName: event.name,
                            url: process.env.FRONTEND_URL + "/event/" + event.publicId + "/join"
                        }
                    }

                });
                await notification.save();
                await notification.notify();
            })
        );

    } catch (e) {
        next(e);
    }

}

export async function getPeople(req: Request, res: Response, next: NextFunction) {
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
                $all: [req.user._id],
            },
        }).select("users invitees defaultPermission exclusionList status").populate([{
            path: "cover",
            select: "publicId thumbnail snapshot"
        }, {
            path: "users",
            select: "username firstName lastName profilePictureSource",
            match: {
                _id: {
                    $ne: req.user._id
                }
            }
        }, {
            path: "invitees",
            select: "username firstName lastName profilePictureSource"
        }])
            .sort({ createdAt: -1 });


        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            eventStatus: event.status,
            permission: event.hasPermission(req.user._id) ? "editor" : "viewer",
            people: [
                ...event.users.map((user: any) => ({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePictureSource: user.profilePictureSource,
                    permission: event.hasPermission(user._id) ? "editor" : "viewer",
                    status: "user",
                })),
                ...event.invitees.map((user: any) => ({
                    _id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    status: "invitee",
                    profilePictureSource: user.profilePictureSource,
                }))
            ]
        });


    } catch (e) {
        next(e);
    }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {

    try {

        const cover = await Models.Media.findOne({
            publicId: req.body.cover
        });

        const event = await Models.Event.findOne({
            _id: req.params.eventId,
            users: {
                $in: [req.user._id]
            }
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        else if (!event.hasPermission(req.user._id)) {
            return res.status(403).json({
                message: "You don't have permission to update this event"
            });
        }


        event.name = req.body?.name ? req.body.name : event?.name;
        event.startsAt = req.body?.startsAt ? req.body.startsAt : event?.startsAt;
        event.endsAt = req.body?.endsAt ? req.body.endsAt : event?.endsAt;
        event.about = req.body?.about ? req.body.about : event?.about;
        event.location = req.body?.location ? req.body.location : event?.location;
        event.locationMapsPayload = req.body?.locationMapsPayload ? req.body.locationMapsPayload : event?.locationMapsPayload;
        event.cover = cover?._id ? cover._id : event?.cover;
        event.status = req.body?.status ? req.body.status : event?.status;


        await event.save();

        res.json({
            message: "Event updated",
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

export async function leaveEvent(req: Request, res: Response, next: NextFunction) {
    try {

        const update = await Models.Event.updateOne({
            $and: [{
                $or: [
                    {
                        publicId: req.params.eventId
                    },
                    {
                        _id: isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : null
                    }
                ]
            }
            ],
            users: {
                $in: [new ObjectId(req.user._id)],
                // $size: {
                //     $gt: 1
                // }
            }
        }, {
            $pull: {
                users: req.user._id,
                invitees: req.user._id,
                exclusionList: req.user._id
            }
        });

        if (update.matchedCount === 0) {
            return res.status(400).json({
                message: "You can't leave this event"
            });
        }

        res.json({
            message: "Left event"
        });

    } catch (err) {
        next(err);
    }
}

export async function getAllEvents(req: Request, res: Response, next: NextFunction) {

    try {

        const query = req.query?.q ? {
            $text: { $search: req.query?.q },
            users: {
                $in: [req.user._id]
            }
        } : {
            users: {
                $in: [req.user._id]
            }
        };

        const skip = req.query.skip ? req.query.skip : 0;


        // @ts-ignore
        const events = await Models.Event.find(query)
            .sort({ startsAt: -1 })
            .skip(Number(skip)).limit(10)
            .populate([{
                path: "cover",
                select: "publicId thumbnail snapshot"
            },
            {
                path: "users",
                select: "firstName lastName profilePictureSource username",
                options: {
                    limit: 6
                }
            }])
            .select("-media");

        res.json({
            events: await Promise.all(events.map(async (event, i) => {


                console.log(req.headers)
                if (req.headers["x-app-version"] && isGreaterVersion(String(req.headers?.["x-app-version"]), "0.22.40")) {

                    const media = await Models.Media.countDocuments({
                        event: event._id
                    })

                    return {
                        ...event.toJSON(),
                        peopleCount: Number((await Models.Event.findById(event._id))?.users.length) + event.invitees?.length + event.nonUsersInvitees?.length,
                        mediaCount: media,
                        users: undefined,
                        invitees: undefined,
                        nonUsersInvitees: undefined,
                        media: undefined,
                        cover: undefined,
                        people: [
                            ...event.users,
                        ],
                        thumbnailUrl: event?.cover?.thumbnail ? await GCP.signedUrl(event.cover.thumbnail) : undefined
                    }

                } else {

                    let buffer = undefined;
                    if (i < 4) {
                        buffer = await getBuffer(event);
                    }
                    const media = await Models.Media.countDocuments({
                        event: event._id
                    })

                    return {
                        ...event.toJSON(),
                        cover: event.cover?.publicId,
                        peopleCount: Number((await Models.Event.findById(event._id))?.users.length) + event.invitees?.length + event.nonUsersInvitees?.length,
                        mediaCount: media,
                        users: undefined,
                        invitees: undefined,
                        nonUsersInvitees: undefined,
                        media: undefined,
                        people: [
                            ...event.users,
                        ],
                        buffer
                    }

                }
            }))
        });

    } catch (e) {
        next(e);
    }

}

export async function getAllInvites(req: Request, res: Response, next: NextFunction) {
    try {
        const events = await Models.Event.find({
            invitees: {
                $in: [req.user._id]
            }
        }).populate([{
            path: "cover",
            select: "publicId thumbnail snapshot"
        }, {
            path: "users",
            select: "profilePictureSource"
        }, {
            path: "invitees",
            select: "profilePictureSource"
        }])
            .sort({ createdAt: -1 })

        res.json({
            events: await Promise.all(events.map(async (event, i) => {

                let buffer = undefined;
                if (i < 4) {
                    buffer = await getBuffer(event);
                }

                return {
                    _id: event._id,
                    publicId: event.publicId,
                    name: event.name,
                    cover: event.cover?.publicId,
                    peopleCount: event.users?.length + event.invitees?.length + event.nonUsersInvitees?.length,
                    users: undefined,
                    invitees: undefined,
                    nonUsersInvitees: undefined,
                    people: event.people(req.user._id),
                    buffer
                }
            }))
        })
    } catch (err) {
        next(err);
    }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {

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
                ]
            }
            ],
        }).populate([
            {
                path: "cover",
                select: "publicId thumbnail snapshot"
            },
            {
                path: "users",
                select: "firstName lastName profilePictureSource username",
                options: {
                    limit: 7
                }
            },
        ]).select("-events");


        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        const buffer =
            req.query?.noBuffer && req.headers["x-app-version"] && isGreaterVersion(String(req.headers?.["x-app-version"]), "0.22.40")
                ? undefined : await getBuffer(event);

        // get cover buffer from google cloud

        const peopleCount = await Models.Event.findById(event._id).populate([{
            path: "users",
            select: "_id",
        }]);

        if (!event.revisitsCache?.[String(req.user._id)] || moment(event["revisitsCache"][String(req.user._id)]).unix() < moment().subtract(10, "minutes").unix()) {
            console.log(moment(event["revisitsCache"][String(req.user._id)]).unix(), moment().subtract(10, "minutes").unix(), event.revisitsCache[String(req.user._id)]);
            event.revisitsCache = {
                ...event.revisitsCache,
                [String(req.user._id)]: new Date()
            }
            event.revisits = event.revisits + 1;
            await event.save();
        }

        res.json({
            message: !event.users?.map(u => u._id.toString()).includes(req.user?._id.toString()) ? "joinRequired" : undefined,
            event: {
                ...event.toJSON(),
                cover: event.cover?.publicId,
                peopleCount: peopleCount?.users?.length,
                mediaCount: event.media.length,
                users: undefined,
                invitees: undefined,
                nonUsersInvitees: undefined,
                buffer,
                people: event.people(req.user._id),
                hasPermission: event.hasPermission(req.user._id),
                muted: event.mutedList?.includes(req.user._id.toString()),
                thumbnailUrl: event?.cover?.thumbnail && req.headers["x-app-version"] && isGreaterVersion(String(req.headers?.["x-app-version"]), "0.22.40") ? await GCP.signedUrl(event.cover.thumbnail) : undefined
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

        if (!event.hasPermission(req.user._id)) {
            return res.status(401).json({
                message: "You don't have permission to do this"
            })
        }

        const usersToNotify = []

        if (req.body.add.length) {
            const usersToAdd = await Models.User.find({
                _id: {
                    $in: req.body.add,
                    $nin: [...event.users, ...event.invitees],
                    $ne: req.user._id
                }
            }).select("_id");
            event.invitees = _.uniq([
                ...event.invitees.map(id => id.toString()),
                ...usersToAdd.map((user: any) => user._id.toString())
            ]);
            usersToNotify.push(
                ...usersToAdd
                    .map((user: any) => user._id.toString())
            );

        }


        if (req.body.remove.length) {
            const usersToRemove = await Models.User.find({
                _id: {
                    $in: req.body.remove,
                    $ne: req.user._id
                }
            }).select("_id");
            event.users = event.users.filter((user: any) => !usersToRemove.map((user: any) => user._id.toString()).includes(user._id.toString()));
            event.invitees = event.invitees.filter((user: any) => !usersToRemove.map((user: any) => user._id.toString()).includes(user._id.toString()));
            event.exclusionList = event.exclusionList.filter((userId: any) => event.users.includes(userId.toString()));
        }

        await event.save();

        res.json({
            people: event.people(req.user._id)
        });

        await Promise.all(
            [...usersToNotify].map(async (invitee: any) => {
                const notification = new Models.Notification({
                    user: invitee,
                    title: "New invite",
                    body: `${req.user.firstName} has invited you to ${event.name}`,
                    data: {
                        type: "eventInvite",
                        payload: {
                            eventId: event._id,
                            userName: req.user.firstName,
                            userProfilePictureSource: req.user?.profilePictureSource,
                            eventName: event.name,
                            url: process.env.FRONTEND_URL + "/event/" + event.publicId + "/join"
                        }
                    }

                });
                await notification.save();
                await notification.notify();
            })
        );




    } catch (e) {
        next(e);
    }
}

export const updatePermissions = async (req: any, res: any, next: any) => {
    try {

        if (!req.params.userId || req.params.userId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "Missing userId"
            })
        }


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
                $all: [req.params.userId, req.user._id],
            },
        }).select("users defaultPermission exclusionList");

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (!event.hasPermission(req.user._id)) {
            return res.status(401).json({
                message: "You don't have permission to do this"
            })
        }

        await Models.Event.updateOne({
            _id: event._id
        },
            event.exclusionList.includes(req.params.userId) ? {
                $pull: {
                    exclusionList: req.params.userId
                }
            } : {
                $push: {
                    exclusionList: req.params.userId
                }
            });

        return res.sendStatus(200);

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
        event.invitees = event.invitees.filter((user: any) => user._id.toString() !== req.user._id.toString());
        await event.save();

        res.sendStatus(200);

        console.log(...event.users);

        await Promise.all(
            [...event.users].filter((userId: any) => {
                if (event?.mutedList?.includes(userId.toString())) {
                    return false;
                }
            })
                .map(async (invitee: any) => {
                    const notification = new Models.Notification({
                        user: invitee,
                        title: event.name,
                        body: `${req.user.firstName} joined the event`,
                        data: {
                            type: "eventJoin",
                            payload: {
                                eventId: event._id,
                                userId: req.user,
                                userName: req.user.firstName,
                                eventName: event.name,
                                url: process.env.FRONTEND_URL + "/event/" + event.publicId,
                                userProfilePictureSource: req.user?.profilePictureSource,
                            }
                        }

                    });
                    await notification.save();
                    await notification.notify();
                })
        );

    } catch (e) {
        next(e);
    }
}

export const mediaList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const event = await Models.Event.findOne({
            $or: [
                {
                    publicId: req.params.eventId
                },
                {
                    _id: isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : null
                }
            ]
        }).select({
            media: 1,
        }).populate({
            path: "media",
            select: "_id publicId storageLocation snapshot thumbnail createdAt user type",
            match: {
                user: req.query.me ? req.user._id : {
                    $exists: true
                }
            },
            options: {
                sort: {
                    timestamp: -1
                },
                limit: req.query?.limit ? Number(req.query.limit) : 30,
                skip: req.query?.skip ? Number(req.query.skip) : 0
            }
        }).lean();


        if (!event) {
            return res.sendStatus(404);
        }

        res.json({
            media: (await Promise.all(event.media.map(async (media: any) => {
                return {
                    _id: media._id,
                    publicId: media.publicId,
                    storageLocation: media.storageLocation ? await GCP.signedUrl(media.storageLocation) : undefined,
                    snapshot: media.snapshot ? await GCP.signedUrl(media.snapshot) : undefined,
                    thumbnail: media.thumbnail ? await GCP.signedUrl(media.thumbnail) : undefined,
                    createdAt: media.createdAt,
                    type: media.type.split("/")[0],
                    user: media.user
                }
            })))
        });


    } catch (Err) {
        next(Err);
    }
}

export async function byMe(req: Request, res: Response, next: NextFunction) {
    try {

        const media = await Models.Media.find({
            user: req.user._id,
            event: req.params.eventId
        })
            .countDocuments();

        return res.json(media);

    } catch (err) {
        next(err);
    }
}

export async function muteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = await Models.Event.findOne({
            $or: [
                {
                    publicId: req.params.eventId
                },
                {
                    _id: isObjectIdOrHexString(req.params.eventId) ? req.params.eventId : null
                }
            ]
        });

        if (!event) {
            return res.sendStatus(404);
        }

        if (!event.hasPermission(req.user._id)) {
            return res.status(401).json({
                message: "You don't have permission to do this"
            })
        }


        if (event.mutedList.includes(req.user._id.toString())) {
            event.mutedList = event.mutedList.filter((user: any) => user.toString() !== req.user._id.toString());
            await event.save();
            return res.json({
                muted: false
            });
        }

        event.mutedList.push(req.user._id);
        await event.save();
        return res.json({
            muted: true
        });

    } catch (err) {
        next(err);
    }
}