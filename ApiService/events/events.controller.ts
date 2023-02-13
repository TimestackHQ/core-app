import {NextFunction, Request, Response} from "express";
import {GCP, Models} from "../../shared";
import {EventSchema} from "../../shared/models/Event";
import {isObjectIdOrHexString} from "../../shared";
import * as _ from "lodash";

const getBuffer = async (event: EventSchema): Promise<String | undefined> => {
    const cover = event.cover;

    if(cover.snapshot) return Buffer.from(await GCP.download(cover.snapshot)).toString('base64');
    else if(cover.thumbnail) return Buffer.from(await GCP.download(cover.thumbnail)).toString('base64');
}

const standardEventPopulation = [{
    path: "cover",
    select: "publicId thumbnail snapshot"
},
    {
        path: "users",
        select: "firstName lastName profilePictureSource"
    }, {
        path: "invitees",
        select: "firstName lastName profilePictureSource"
    },{
        path: "nonUsersInvitees",
        select: "firstName lastName profilePictureSource"
    }
]

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
            .populate(standardEventPopulation);

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
                    mediaCount: event.media.length,
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

        // get cover buffer from google cloud
        const buffer = getBuffer(event);

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

        const newPeople = await Models.User.find({
            _id: {
                $in: req.body.addedPeople.filter((i: any) => isObjectIdOrHexString(i._id)).map((invitee: any) => invitee._id)
            }
        }).select("_id");

        event.invitees = [
            ...event.invitees,
            ...newPeople.map((user: any) => user._id)
        ];

        event.nonUsersInvitees = [...event.nonUsersInvitees, ...req.body.addedPeople
            .filter((invitee: any) => !isObjectIdOrHexString(invitee?._id))
            .map((invitee: { phoneNumber: any; email: any; firstName: any; lastName: any; }) => ({
                phoneNumber: invitee?.phoneNumber,
                email: invitee?.email,
                firstName: invitee?.firstName,
                lastName: invitee?.lastName
            }))
            .filter((invitee: {}) => Object.keys(invitee).length > 0)
        ];

        const removedPeople = await Models.User.find({
            _id: {
                $in: req.body.removedPeople.filter((i: any) => isObjectIdOrHexString(i._id)).map((invitee: any) => invitee._id)
            }
        });

        console.log(req.body.removedPeople)

        event.invitees = event.invitees.filter((invitee: any) => {
            console.log(invitee, removedPeople.find(removed => removed?._id.toString() === invitee?._id.toString()));
            if(removedPeople.find(removed => removed?._id.toString() === invitee.toString())) {
                console.log("yes")
                return false
            }
            return true;
        });
        event.nonUsersInvitees = event.nonUsersInvitees.filter((invitee: any) => {
            return !req.body.removedPeople.find((removed: { _id: { toString: () => any; }; }) => removed._id.toString() == invitee._id.toString());
        });

        await event.save();

        return res.json({
            people: event.people(req.user._id)
        });


    } catch (e) {
        next(e);
    }
}