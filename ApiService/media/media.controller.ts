import { NextFunction, Request, Response } from "express";
import { AWS, Models } from "../../shared";
import { v4 as uuid } from 'uuid';
import moment = require("moment");
import { IUser } from "../../shared/models/User";
import { IMAGE_FORMAT_OPTIONS, MEDIA_FORMAT_OPTIONS, MEDIA_HOLDER_TYPES, MEDIA_QUALITY_OPTIONS } from "../../shared/consts";
import { IMedia } from "../../shared/@types/Media";
import { IContent } from "../../shared/models/Content";
import { AWSS3ObjectType } from "shared/@types/global";
import { PersonType } from "../@types";
import mongoose, { Promise } from "mongoose";

export async function uploadCover(req: Request, res: Response, next: NextFunction) {

    try {

        // const file: Express.Multer.File | undefined = req.file;

        // const fileId = uuid();

        // // @ts-ignore
        // const mediaFile = Array(...req?.files)?.find((file: Express.Multer.File) => file.fieldname === "media");
        // const thumbnail = Array(...req?.files)?.find((file: Express.Multer.File) => file.fieldname === "thumbnail");
        // const snapshot = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "snapshot");


        // await AWS.upload(thumbnail.originalname, <Buffer>thumbnail.buffer);
        // if (snapshot) {
        //     await AWS.upload(snapshot.originalname, <Buffer>snapshot.buffer);
        // }


        // const media = new Models.Media({
        //     publicId: fileId,
        //     // @ts-ignore
        //     storageLocation: thumbnail.originalname,
        //     thumbnail: thumbnail.originalname,
        //     snapshot: snapshot ? snapshot.originalname : undefined,
        //     // @ts-ignore
        //     type: thumbnail.mimetype,
        //     group: "cover",
        //     user: req.user._id,
        //     timestamp: new Date(),
        // });

        // await media.save();

        // res.status(200).json({
        //     message: "Cover uploaded successfully",
        //     media: {
        //         publicId: media._id,
        //         storageLocation: media.storage.path,
        //     },
        // });

        // await AWS.upload(mediaFile.originalname, <Buffer>mediaFile.buffer);

        // media.storageLocation = mediaFile.originalname;
        // media.type = mediaFile.mimetype;
        // await media.save();





    } catch (e) {
        next(e);
    }

}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { mediaId } = req.params;

        const media = await Models.Media.findOne({
            _id: mediaId,
        });

        if (!media || media.status !== "active") {
            return res.sendStatus(404);
        }

        console.log(media)
        return res.json({
            thumbnail: await media.getThumbnailLocation(),
            fullsize: await media.getFullsizeLocation(),
        });
    } catch (e) {
        next(e);
    }

}

export type MediaInView = {
    _id: string;
    thumbnail: AWSS3ObjectType;
    fullsize: AWSS3ObjectType;
    timestamp: Date;
    contentId?: string;
    user?: PersonType
    hasPermission: Boolean
}

export const viewMedia = async (req: Request, res: Response<{
    media: MediaInView
}>, next: NextFunction) => {
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

        const user = media.user as IUser;


        return res.json({


            media: {
                _id: media?._id.toString(),
                fullsize: await media.getFullsizeLocation(),
                thumbnail: await media.getThumbnailLocation(),
                timestamp: media.timestamp,
                contentId: media?.content?.toString(),
                user: media.user ? {
                    _id: user._id.toString(),
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    username: user.username,
                    profilePictureSource: user?.profilePictureSource
                } : undefined,
                hasPermission:
                    holder instanceof Models.Event ? holder?.hasPermission(req.user._id) : req.user._id.toString() === user?._id.toString(),
            }
        });
    } catch (e) {
        next(e);
    }

}

export type CreateMediaType = {
    uploadLocalDeviceRef?: string,
    holderId: string,
    holderType: typeof MEDIA_HOLDER_TYPES[number],
    mediaQuality: typeof MEDIA_QUALITY_OPTIONS[number],
    mediaFormat: typeof MEDIA_FORMAT_OPTIONS[number],
    metadata?: any,
    timestamp?: string
} | {
    mediaQuality: typeof MEDIA_QUALITY_OPTIONS[number],
    mediaFormat: typeof MEDIA_FORMAT_OPTIONS[number],
    holderType: "cover",
    metadata?: any,
    timestamp?: string
}

export async function createMedia(req: Request, res: Response, next: NextFunction) {

    try {

        const query: CreateMediaType = req.query as CreateMediaType;

        console.log(req.files)
        if (!req.files) {
            return res.status(400).json({
                message: "No file provided"
            });
        }

        console.log(req.files);

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const thumbnailFile = files["mediaThumbnail"][0];
        const mediaFile = files["mediaFile"][0];

        const thumbnailFilename = `${uuid()}.${thumbnailFile.originalname.split(".").pop()?.toLowerCase()}`;
        const mediaFilename = `${uuid()}.${mediaFile.originalname.split(".").pop()?.toLowerCase()}`;

        if (
            !MEDIA_FORMAT_OPTIONS.includes(thumbnailFilename.split(".").pop() as typeof MEDIA_FORMAT_OPTIONS[number]) ||
            !MEDIA_FORMAT_OPTIONS.includes(mediaFilename.split(".").pop() as typeof MEDIA_FORMAT_OPTIONS[number])
        ) {
            return res.status(400).json({
                message: "Invalid file format"
            });
        };

        const thumbnailStorageLocation = await AWS.upload(thumbnailFilename, <Buffer>thumbnailFile.buffer);

        const media = new Models.Media({
            files: [{
                storage: {
                    path: thumbnailStorageLocation.Key,
                    bucket: thumbnailStorageLocation.Bucket,
                    url: thumbnailStorageLocation.Location,
                },
                format: thumbnailFilename.split(".").pop(),
                quality: "lowest",
            }],
            type: IMAGE_FORMAT_OPTIONS.includes(mediaFilename.split(".").pop() as typeof IMAGE_FORMAT_OPTIONS[number]) ? "image" : "video",
            user: req.user._id,
            metadata: req.query.metadata,
            timestamp: query.timestamp ? moment.utc(query?.timestamp, "YYYY-MM-DDTHH:mm:ss.SSSZ").toDate() : new Date(),
        });

        await media.save();

        if (query.holderType === "socialProfile" || query.holderType === "event") {
            const holder = query.holderType === "socialProfile" ? await Models.SocialProfile.findOne({
                _id: query.holderId,
                users: {
                    $in: [req.user._id]
                },
            }) : query.holderType === "event" ? await Models.Event.findOne({
                _id: query.holderId,
                users: {
                    $in: [req.user._id]
                }
            }) : undefined;


            if (holder && holder?.permissions(req.user._id).canUploadMedia) {

                const groupQuery = {
                    uploadLocalDeviceRef: query.uploadLocalDeviceRef,
                    relatedSocialProfiles: {
                        $in: holder._id
                    }
                }


                let content: IContent | null = null;

                if (query.uploadLocalDeviceRef) {
                    let group = await Models.MediaGroup.findOneAndUpdate(groupQuery, {
                        $push: {
                            media: media._id
                        }
                    });

                    if (!group) {

                        group = await Models.MediaGroup.create({
                            uploadLocalDeviceRef: query.uploadLocalDeviceRef,
                            relatedSocialProfiles: [holder._id],
                            media: [media._id],
                            timestamp: query.timestamp ? moment.utc(query?.timestamp, "YYYY-MM-DDTHH:mm:ss.SSSZ").toDate() : new Date(),
                        });

                        content = await Models.Content.create({
                            contentType: query.uploadLocalDeviceRef ? "mediaGroup" : "media",
                            contentId: group._id,
                            createdAt: new Date(),
                            timestamp: query.timestamp ? moment.utc(query?.timestamp, "YYYY-MM-DDTHH:mm:ss.SSSZ").toDate() : new Date(),
                        });

                        await holder.updateOne({
                            $push: {
                                content: content._id
                            }
                        });




                    }

                } else {
                     content = await Models.Content.create({
                        contentType: query.uploadLocalDeviceRef ? "mediaGroup" : "media",
                        contentId: media._id,
                        createdAt: new Date(),
                        timestamp: query.timestamp ? moment.utc(query?.timestamp, "YYYY-MM-DDTHH:mm:ss.SSSZ").toDate() : new Date(),
                    });

                    await holder.updateOne({
                        $push: {
                            content: content._id
                        }
                    });
                }


                if (content) {
                    const update = {
                        "$push": {},
                    };

                    if (query.holderType === "event") {
                        update["$push"] = {
                            events: holder._id
                        };
                    } else if (query.holderType === "socialProfile") {
                        update["$push"] = {
                            socialProfiles: holder._id
                        };
                    }

                    if (Object.keys(update).length > 0) {
                        await Models.Content.updateOne({ _id: content._id }, update, {
                            upsert: true
                        });
                    }

                    media.content = content._id;
                }

            }
        }

        await media.save();

        res.status(200).json({
            message: "Media uploaded successfully",
            media: {
                _id: media._id
            }
        });

        const mediaStorageLocation = await AWS.upload(mediaFilename, <Buffer>mediaFile.buffer);

        await Models.Media.updateOne({
            _id: media._id
        }, {
            $push: {
                files: {
                    storage: {
                        path: mediaStorageLocation.Key,
                        bucket: mediaStorageLocation.Bucket,
                        url: mediaStorageLocation.Location,
                    },
                    format: mediaFilename.split(".").pop(),
                    quality: query.mediaQuality,
                }
            }
        });

    } catch (e) {
        next(e);
    }



}


export async function deleteMemories(req: Request, res: Response, next: NextFunction) {
    try {

        const { holderId, ids } = req.params;

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

        const content = await Models.Content.find({
            _id: {
                $in: ids
            }
        });

        for await (const item of content) {
            if (item.contentType === "mediaGroup") {
                const mediaGroup = await Models.MediaGroup.findOne({
                    _id: item.contentId
                }).populate<IMedia>("media");

                for await (const media of mediaGroup?.media || []) {
                    await Promise.allSettled((media as IMedia).files.map(files => AWS.deleteFile(files.storage.path)));
                    await (media as IMedia).remove();
                }

                await mediaGroup?.remove();

            } else if (item.contentType === "media") {
                const media = await Models.Media.findOne({
                    _id: item.contentId
                }).populate<IMedia>("files");

                await Promise.allSettled(media?.files.map(files => AWS.deleteFile(files.storage.path)));
                await media?.remove();
            }

            await item.remove();
        }

        await holder.updateOne({
            $pull: {
                content: {
                    $in: ids
                }
            }
        });

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
}


