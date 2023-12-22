import { NextFunction, Request, Response } from "express";
import { AWS, Models, isGreaterVersion } from "../../shared";
import { isObjectIdOrHexString } from "../../shared";
import * as _ from "lodash";
import { ObjectId } from "bson";
import moment = require("moment");
import { IMedia } from "shared/@types/Media";
import { MediaInternetType } from "../../shared/@types/public";
import mongoose from "mongoose";
import { EventObject } from "../@types/dto";
import { IEvent } from "shared/models/Event";

export async function createEvent(req: Request, res: Response, next: NextFunction) {

    try {

        // finds existing users
        const users = await Models.User.find({
            _id: {
                $in: req.body.invitees
            }
        });

        const cover = await Models.Media.findById(req.body?.cover);

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
            cover: cover?._id || undefined,
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
        const event = await Models.Event.findById(req.params.eventId).select("users invitees defaultPermission exclusionList status").populate([{
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
        cover?._id ? event.cover = cover?._id : null;
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
            _id: req.params.eventId,
            users: {
                $in: [new ObjectId(req.user._id)]
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
            .skip(Number(skip)).limit(Number(req.query?.limit) || 100)
            .populate([{
                path: "cover",
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

                const cover = event.cover as IMedia;


                const media = await Models.Media.countDocuments({
                    event: event._id
                })

                return {
                    ...event.toJSON(),
                    peopleCount: Number((await Models.Event.findById(event._id))?.users.length) + event.invitees?.length + event.nonUsersInvitees?.length,
                    mediaCount: event.content.length,
                    users: undefined,
                    invitees: undefined,
                    nonUsersInvitees: undefined,
                    media: undefined,
                    cover: undefined,
                    people: [
                        ...event.users,
                    ],
                    content: undefined,
                    thumbnailUrl: await cover?.getThumbnailLocation(),
                }

            }))
        });

    } catch (e) {
        next(e);
    }

}

export async function getAllInvites(req: Request, res: Response<{
    events: EventObject[]
}>, next: NextFunction) {
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
            .sort({ createdAt: -1 });

        res.json({
            events: await Promise.all(events.map(async (event, i) => {


                const cover = event.cover as IMedia;

                return {
                    _id: event._id.toString(),
                    name: event.name,
                    startsAt: event.startsAt,
                    endsAt: event?.endsAt,
                    location: event?.location,
                    about: event?.about,
                    locationMapsPayload: event?.locationMapsPayload,
                    status: event?.status,
                    revisits: event.revisits,
                    peopleCount: event?.users?.length || 0,
                    mediaCount: event.content.length,
                    linkedEvents: event.linkedEvents,
                    people: event.people(req.user._id),
                    hasPermission: event.hasPermission(req.user._id),
                    muted: event.mutedList?.includes(req.user._id.toString()),
                    thumbnailUrl: await cover?.getThumbnailLocation(),
                    storageLocation: await cover?.getFullsizeLocation(),
                }
            }))
        })
    } catch (err) {
        next(err);
    }
}

export async function getEvent(req: Request, res: Response<{
    message: string,
    event?: EventObject
}>, next: NextFunction) {

    try {

        const event = await Models.Event.findById(req.params.eventId).populate([
            {
                path: "cover",
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

        const cover = event.cover as IMedia;


        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            })
        }

        const peopleCount = await Models.Event.findById(event._id).populate([{
            path: "users",
            select: "_id",
        }]);

        if (!event.revisitsCache?.[String(req.user._id)] || moment(event["revisitsCache"][String(req.user._id)]).unix() < moment().subtract(10, "minutes").unix()) {
            event.revisitsCache = {
                ...event.revisitsCache,
                [String(req.user._id)]: new Date()
            }
            event.revisits = event.revisits + 1;
            await event.save();
        }

        res.json({
            // @ts-ignore
            message: !event.users?.map(u => u._id.toString()).includes(req.user?._id.toString()) ? "joinRequired" : undefined,
            event: {
                _id: event._id.toString(),
                name: event.name,
                startsAt: event.startsAt,
                endsAt: event?.endsAt,
                location: event?.location,
                about: event?.about,
                locationMapsPayload: event?.locationMapsPayload,
                status: event?.status,
                revisits: event.revisits,
                peopleCount: peopleCount?.users?.length || 0,
                mediaCount: event.content.length,
                linkedEvents: event.linkedEvents,
                people: event.people(req.user._id),
                hasPermission: event.hasPermission(req.user._id),
                muted: event.mutedList?.includes(req.user._id.toString()),
                thumbnailUrl: await cover?.getThumbnailLocation(),
                storageLocation: await cover?.getFullsizeLocation(),
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

        await Promise.all(
            [...event.users].filter((userId: any) => {
                if (event?.mutedList?.includes(userId.toString())) {
                    return false;
                }
                return true;
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


        const event = await Models.Event.findById(req.params.eventId).populate([
            {
                path: "cover",
                select: "publicId thumbnail snapshot storageLocation"
            },
            {
                path: "users",
                select: "firstName lastName profilePictureSource username",
                options: {
                    limit: 7
                }
            },
        ])
            .select("content")
            .populate([{
                path: "content",
                options: {
                    limit: 30,
                    skip: req.query?.skip ? Number(req.query.skip) : 0,
                    sort: {
                        createdAt: 1
                    }
                }
            }])
            .lean();

        if (!event) {
            return res.sendStatus(404);
        }
        if (event.content.length === 0) {
            return res.json({
                content: []
            })
        }

        const media = await Models.Media.find({
            _id: {
                $in: event.content.filter((contentReference) => contentReference.contentType === "media").map((contentReference) => contentReference.contentId)
            }
        });

        const groups = await Models.MediaGroup.find({
            _id: {
                $in: event.content.filter((contentReference) => contentReference.contentType === "mediaGroup").map((contentReference) => contentReference.contentId)
            }
        });

        const content = [
            ...media.map(media => ({
                payload: media,
                createdAt: media.createdAt,
            })),
            ...groups.map(group => ({
                payload: group,
                createdAt: group.createdAt,
            }))
        ];

        const mediaContent = (await Promise.all(content.map(async (contentHolder): Promise<MediaInternetType> => {
            const content = contentHolder.payload;

            let response: MediaInternetType | null = null;

            if (content instanceof Models.Media) {
                response = {
                    _id: content._id.toString(),
                    fullsize: await content.getFullsizeLocation(),
                    thumbnail: await content.getThumbnailLocation(),
                    createdAt: content.createdAt,
                    contentId: content._id.toString(),
                    hasPermission: content.user.toString() === req.user._id.toString(),
                    user: content.user.toString(),
                    timestamp: content.timestamp,
                    type: content?.type,
                    mediaList: [],
                    isGroup: false,
                    groupLength: 0,
                    isPlaceholder: false,
                    indexInGroup: 0,
                    isProcessing: false,
                }
            } else if (content instanceof Models.MediaGroup) {
                const media = await Models.Media.findById(content.media[0]);

                if (!media) throw new Error("Media not found");
                response = {
                    _id: media._id.toString(),
                    contentId: media._id.toString(),
                    fullsize: await media.getFullsizeLocation(),
                    thumbnail: await media.getThumbnailLocation(),
                    createdAt: media.createdAt,
                    hasPermission: media.user.toString() === req.user._id.toString(),
                    user: media.user.toString(),
                    timestamp: media.timestamp,
                    type: media?.type,
                    isGroup: true,
                    groupLength: content.media.length,
                    mediaList: (content.media as mongoose.Schema.Types.ObjectId[]).map(id => id.toString()),
                    isPlaceholder: false,
                    indexInGroup: 0,
                    isProcessing: false,
                }
            }

            if (!response) throw new Error("Response is undefined");

            return {
                ...response,
                isProcessing: response?.thumbnail?.path === response?.fullsize?.path,
            }
        }))).sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix())

        res.json({
            content: mediaContent
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

export async function linkEvent(req: Request, res: Response) {
    try {

        const parentEvent = await Models.Event.findById(req.params.eventId);

        if (!parentEvent) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        if (req.body.isLinked) {
            const childEvent = await Models.Event.findById(req.params.targetEventId);

            if (!childEvent || parentEvent._id.toString() === childEvent._id.toString()) return res.status(404).json({
                message: "Event not found"
            });

            if (parentEvent.linkedEvents.includes(childEvent._id.toString())) return res.status(400).json({
                message: "Event already linked"
            });

            parentEvent.linkedEvents.push(childEvent._id);

            await parentEvent.save();
        } else {
            parentEvent.linkedEvents = parentEvent.linkedEvents.filter((id: any) => id.toString() !== req.params.targetEventId);

            await parentEvent.save();
        }

        return res.sendStatus(200);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function getLinkedEvents(req: Request, res: Response) {


    try {
        const parentEvent = await Models.Event.findById(req.params.eventId)

            .populate<IEvent[]>({
                path: "linkedEvents",
                populate: [{
                    path: "cover",
                }]
            });

        if (!parentEvent) return res.status(404).json({
            message: "Event not found"
        });

        const events: {
            _id: string,
            name: string,
            thumbnailUrl: EventObject["thumbnailUrl"],
            storageLocation: EventObject["storageLocation"],
        }[] = [];

        await Promise.all((parentEvent.linkedEvents as IEvent[]).map(async (event: IEvent): Promise<void> => {

            const cover = event.cover as IMedia;

            events.push({
                _id: event._id.toString(),
                name: event.name,
                thumbnailUrl: await cover?.getThumbnailLocation(),
                storageLocation: await cover?.getFullsizeLocation(),
            });

        }));

        return res.json({
            linkedEvents: events.map((event) => ({
                _id: event._id.toString(),
                name: event.name,
                thumbnailUrl: event.thumbnailUrl,
                storageLocation: event.storageLocation,
            }))
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }


}