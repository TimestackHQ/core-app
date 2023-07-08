import { NextFunction, Request, Response } from "express";
import { GCP, Logger, Models } from "../../shared";
import { v4 as uuid } from 'uuid';
import moment = require("moment");

export async function uploadCover(req: Request, res: Response, next: NextFunction) {

    try {

        const file: Express.Multer.File | undefined = req.file;

        const fileId = uuid();

        // @ts-ignore
        const mediaFile = Array(...req?.files)?.find((file: Express.Multer.File) => file.fieldname === "media");
        const thumbnail = Array(...req?.files)?.find((file: Express.Multer.File) => file.fieldname === "thumbnail");
        const snapshot = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "snapshot");


        await GCP.upload(thumbnail.originalname, <Buffer>thumbnail.buffer);
        if (snapshot) {
            await GCP.upload(snapshot.originalname, <Buffer>snapshot.buffer);
        }


        const media = new Models.Media({
            publicId: fileId,
            // @ts-ignore
            storageLocation: thumbnail.originalname,
            thumbnail: thumbnail.originalname,
            snapshot: snapshot ? snapshot.originalname : undefined,
            // @ts-ignore
            type: thumbnail.mimetype,
            group: "cover",
            user: req.user._id,
            timestamp: new Date(),
        });

        await media.save();

        res.status(200).json({
            message: "Cover uploaded successfully",
            media: {
                publicId: media.publicId,
                storageLocation: media.storageLocation,
            },
        });

        await GCP.upload(mediaFile.originalname, <Buffer>mediaFile.buffer);

        media.storageLocation = mediaFile.originalname;
        media.type = mediaFile.mimetype;
        await media.save();





    } catch (e) {
        next(e);
    }

}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { publicId } = req.params;
        const media = await Models.Media.findOne({
            publicId,
        });

        if (!media) {
            return res.sendStatus(404);
        }

        if (media?.snapshot && req.query?.snapshot == "true") {
            return res.send(await GCP.signedUrl(media.snapshot));
        }

        if (media?.thumbnail && (req.query?.thumbnail == "true" || req.query?.snapshot == "true")) {
            return res.send(await GCP.signedUrl(media.thumbnail));
        }

        if (media?.thumbnail === media?.storageLocation) {
            return res.send(await GCP.signedUrl(media.thumbnail));
        }


        console.log(await GCP.signedUrl(media.storageLocation))
        return res.send(await GCP.signedUrl(media.storageLocation));

    } catch (e) {
        next(e);
    }

}

export const viewMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { holderId, mediaId } = req.params;
        const holder = req.query?.profile ?
            await Models.SocialProfile.findOne({
                _id: holderId,
                users: {
                    $in: [req.user._id]
                },
            }) : await Models.Event.countDocuments({
                _id: holderId,
                users: {
                    $in: [req.user._id]
                }
            });
        if (!holder) {
            return res.sendStatus(404);
        }
        const media = await Models.Media.findOne({
            _id: mediaId,
            event: holderId
        }).populate({
            path: "user",
            select: "firstName lastName profilePictureSource"
        });

        if (!media) {
            return res.sendStatus(404);
        }

        return res.json({
            media: {
                _id: media?._id,
                publicId: media.publicId,
                fileName: media.storageLocation,
                storageLocation: await GCP.signedUrl(media?.storageLocation),
                snapshot: media.snapshot ? await GCP.signedUrl(media.snapshot) : undefined,
                thumbnail: media.thumbnail ? await GCP.signedUrl(media.thumbnail) : undefined,
                timestamp: media.metadata.timestamp,
                type: media.type.split("/")[0],
                user: media.user ? {
                    _id: media.user._id,
                    firstName: media.user?.firstName,
                    lastName: media.user?.lastName,
                    profilePictureSource: media.user?.profilePictureSource
                } : {},
                hasPermission:
                    holder instanceof Models.Event ? holder?.hasPermission(req.user._id) : req.user._id.toString() === media.user?._id.toString(),
            }
        });
    } catch (e) {
        next(e);
    }

}

export async function upload(req: Request, res: Response, next: NextFunction) {

    try {

        const holderId = req.params.holderId

        let holderObject = null;

        console.log(req)

        if (req.query?.profile) {

            console.log("profile")

            holderObject = await Models.SocialProfile.findOne({
                _id: holderId,
                users: {
                    $in: [req.user._id]
                }
            });

            if (holderObject && !holderObject?.permissions(req.user._id).canUploadMedia) {
                return res.status(403).json({
                    message: "You don't have permission to upload to this profile"
                });
            }

        } else {

            holderObject = await Models.Event.findOne({
                _id: holderId,
                $or: [
                    {
                        users: {
                            $in: [req.user._id]
                        }
                    },
                    {
                        createdBy: req.user._id
                    }
                ]
            });

            if (holderObject && !holderObject?.hasPermission(req.user._id)) {
                return res.status(403).json({
                    message: "You don't have permission to upload to this event"
                });
            }

        }

        if (!holderObject) {
            return res.sendStatus(404);
        }

        const fileId = uuid();

        // @ts-ignore
        const file = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "media");
        const thumbnail = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "thumbnail");
        const snapshot = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "snapshot");


        await GCP.upload(thumbnail.originalname, <Buffer>thumbnail.buffer);
        if (snapshot) {
            await GCP.upload(snapshot.originalname, <Buffer>snapshot.buffer);
        }

        const body = {
            publicId: fileId,
            // @ts-ignore
            storageLocation: thumbnail.originalname,
            thumbnail: thumbnail.originalname,
            snapshot: snapshot ? snapshot.originalname : undefined,
            // @ts-ignore
            type: req.body.type ? req.body.type : file.mimetype.split("/")[0],
            group: "event",
            user: req.user._id,
            metadata: req.body.metadata ? {
                timestamp:
                    JSON.parse(req.body.metadata)?.timestamp
                        ? moment(JSON.parse(req.body.metadata)?.timestamp).toDate()
                        : undefined
            } : null,
            timestamp: req.body.metadata ? JSON.parse(req.body.metadata)?.timestamp
                ? moment(JSON.parse(req.body.metadata)?.timestamp).toDate()
                : undefined : undefined,
            event: holderObject._id
        }


        const media = new Models.Media(body);

        await media.save();

        if (holderObject instanceof Models.SocialProfile) {
            if (req.query.groupName) {
                let inserted = false;
                for (const group of holderObject.groups) {
                    if (group.name.toString() === req.query.groupName) {
                        group.media.push(media._id);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    holderObject.groups.push({
                        name: String(req.query.groupName),
                        media: [media._id],
                        timestamp: media.timestamp
                    });
                }
            } else {
                holderObject.media.push(media._id);
            }
            await holderObject.save();

        } else {
            holderObject.media.push(media._id);
            await holderObject.save();
        }


        res.status(200).json({
            message: "Media uploaded successfully",
            media: {
                publicId: media.publicId,
                storageLocation: media.storageLocation,
            }
        });

        await GCP.upload(file.originalname, <Buffer>file.buffer);
        media.storageLocation = file.originalname;
        await media.save();

    } catch (e) {
        next(e);
    }

}



export async function getUploadedMedia(req: Request, res: Response, next: NextFunction) {
    try {


        if (!req.query?.gte) {
            return res.status(400).json({
                message: "gte is required"
            });
        }

        const event = await Models.Event.findOne({
            _id: req.params.eventId,
            users: {
                $in: [req.user._id]
            }
        });

        if (!event) return res.sendStatus(404);

        const newMedia = await Models.Media.find({
            event: event._id,
            user: req.user._id,
            group: "event",
            createdAt: {
                $gte: moment(String(req.query?.gte)).toDate()
            }
        })
            .select("publicId")
            .sort({ createdAt: 1 });

        return res.json({
            media: newMedia.map(m => m.publicId),
            mediaCount: event.media.length
        });

    } catch (err) {
        next(err);
    }
}

export async function deleteMemories(req: Request, res: Response, next: NextFunction) {
    try {

        const { holderId, mediaId } = req.params;

        const holder = req.query?.profile ?
            await Models.SocialProfile.findOne({
                _id: holderId,
                users: {
                    $in: [req.user._id]
                },
            }) : await Models.Event.findOne({
                _id: holderId,
                users: {
                    $in: [req.user._id]
                }
            });

        if (!holder) {
            return res.sendStatus(404);
        }
        else if ((holder instanceof Models.Event && !holder.hasPermission(req.user._id))) {
            return res.status(403).json({
                message: "You don't have permission to delete media from this event"
            });
        }

        const media = await Models.Media.find({
            _id: {
                $in: req.body.ids
            },
            event: holder._id,
        });

        await Models.Event.updateOne({
            _id: req.params.eventId,
            users: {
                $in: [req.user._id]
            },
        }, {
            $pull: {
                media: {
                    $in: media.map(m => m._id)
                }
            }
        });

        try {
            await Promise.all(media.map(async m => {
                if (holder instanceof Models.SocialProfile && m.user.toString() !== req.user._id.toString()) return;
                await GCP.deleteFile(m.storageLocation);
                if (m.thumbnail) await GCP.deleteFile(m.thumbnail);
                if (m.snapshot) await GCP.deleteFile(m.snapshot);
                await Models.Media.deleteOne({
                    _id: m._id
                });
            }));
        } catch (Err) {
            console.log(Err);
        }


        await Models.Media.deleteMany({
            _id: {
                $in: media.map(m => m._id)
            },
            user: req.user._id,
        });


        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
}


