import {NextFunction, Request, Response} from "express";
import {Compress, GCP, Logger, Models} from "../../shared";
import {v4 as uuid} from 'uuid';
import * as mime from "mime-types";
// @ts-ignore
import * as Ffmpeg from "fluent-ffmpeg";
import * as sharp from "sharp";
import * as fs from "fs";
import moment = require("moment");

const bucket = GCP.storage.bucket(String(process.env.GCP_STORAGE_BUCKET));

export async function uploadCover (req: Request, res: Response, next: NextFunction) {

    try {

        const file: Express.Multer.File | undefined = req.file;

        let thumbnail: any;
        let snapshot: any;

        const fileId = uuid();

        if(file?.mimetype.split("/")[0] === "image") {

            Logger("Generating thumbnail for image")
            const thumbnailLocation = await Compress.compressImage(fileId, <Buffer>file?.buffer, 51);
            const publicId = fileId+".thumb.jpg";
            await GCP.upload(publicId, <Buffer>fs.readFileSync(thumbnailLocation));
            thumbnail = publicId;

            Logger("Generating snapshot for image")

        }

        if(file?.mimetype.split("/")[0] === "video") {
            Logger("Generating thumbnail for video")
            const thumbnailLocation = await Compress.compressVideo(fileId, <Buffer>file?.buffer, 21, 20, 10);
            const publicId = fileId+".thumb.mp4";
            await GCP.upload(publicId, <Buffer>fs.readFileSync(thumbnailLocation));
            thumbnail = publicId;
            const snapshotPublicId = fileId+".snapshot.jpg";
            await GCP.upload(snapshotPublicId, <Buffer>fs.readFileSync("/tmp/"+snapshotPublicId));
            snapshot = snapshotPublicId;
        }

        const media = new Models.Media({
            publicId: fileId,
            // @ts-ignore
            original: req.file.filename,
            // @ts-ignore
            storageLocation: thumbnail,
            snapshot,
            // @ts-ignore
            type: req.file.mimetype,
            group: "cover",
            user: req.user._id,
            thumbnail,
        });
        await media.save();

        res.status(200).json({
            message: "Cover uploaded successfully",
            media: {
                publicId: media.publicId,
                storageLocation: media.storageLocation,
            },
        });

        if(file?.mimetype.split("/")[0] === "video") {
            Logger("Uploading media to GCP")
            const storageLocation = await Compress.compressVideo(fileId, <Buffer>file?.buffer, 31, 30);
            await GCP.upload(fileId+".mp4", <Buffer>fs.readFileSync(storageLocation));
            media.storageLocation = fileId+".mp4";
            media.publicId = media.storageLocation
        }
        else if(file?.mimetype.split("/")[0] === "image") {
            Logger("Uploading media to GCP")
            const storageLocation = await Compress.compressImage(fileId, <Buffer>file?.buffer, 0);
            await GCP.upload(fileId+".jpg", <Buffer>fs.readFileSync(storageLocation));
            media.storageLocation = fileId+".jpg";
            media.publicId = media.storageLocation
        }

        Logger("Completed")
        await media.save();





    } catch (e) {
        console.log("OUP");
        next(e);
    }

}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {publicId} = req.params;
        const media = await Models.Media.findOne({
            publicId,
        });

        if (!media) {
            return res.sendStatus(404);
        }

        if(media?.snapshot && req.query?.snapshot == "true") {
            return res.send(await GCP.signedUrl(media.snapshot));
        }

        if(media?.thumbnail && (req.query?.thumbnail == "true" || req.query?.snapshot == "true")) {
            return res.send(await GCP.signedUrl(media.thumbnail));
        }

        if(media?.thumbnail === media?.storageLocation) {
            return res.send(await GCP.signedUrl(media.thumbnail));
        }

        return res.send(await GCP.signedUrl(media.publicId));

    } catch (e) {
        next(e);
    }

}

export async function upload (req: Request, res: Response, next: NextFunction) {

    try {

        const event = await Models.Event.findOne({
            _id: req.params.eventId,
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

        if(!event) {
            return res.sendStatus(404);
        }

        const fileId = uuid();

        console.log(req.files)

        // @ts-ignore
        const file = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "media");
        const thumbnail = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "thumbnail");
        const snapshot = Array(...req.files)?.find((file: Express.Multer.File) => file.fieldname === "snapshot");


        await GCP.upload(thumbnail.originalname, <Buffer>thumbnail.buffer);
        if(snapshot) {
            await GCP.upload(snapshot.originalname, <Buffer>snapshot.buffer);
        }

        const media = new Models.Media({
            publicId: fileId,
            // @ts-ignore
            storageLocation: thumbnail.originalname,
            thumbnail: thumbnail.originalname,
            snapshot: snapshot ? snapshot.originalname : undefined,
            // @ts-ignore
            type: file.mimetype,
            group: "event",
            user: req.user._id,
            metadata: JSON.parse(req.body.metadata),
            timestamp: new Date(),
            event: event._id
        });

        await media.save();

        event.media.push(media._id);
        await event.save();

        res.status(200).json({
            message: "Media uploaded successfully",
            media: {
                publicId: media.publicId,
                storageLocation: media.storageLocation,
            }
        });

        await GCP.upload(file.originalname, <Buffer>file.buffer);

    } catch (e) {
        // const file: Express.Multer.File | undefined = req.file;
        // const fileId = uuid();
        //
        // let thumbnail: any;
        // let snapshot: any;
        // let metadata: any = JSON.parse(req.body?.metadata);
        //
        // if(file?.mimetype.split("/")[0] === "image") {
        //
        //     const thumbnailBuffer = await sharp(<Buffer>file?.buffer)
        //         .resize(400)
        //         .jpeg()
        //         .toBuffer();
        //
        //     Logger("Generating thumbnail for image")
        //     const publicId = fileId+".thumb."+mime.extension(file.mimetype);
        //     Logger("Uploading thumbnail to GCP")
        //     await GCP.upload(publicId, <Buffer>thumbnailBuffer);
        //     thumbnail = publicId
        // }
        //
        // if(file?.mimetype.split("/")[0] === "video") {
        //     Logger("Generating thumbnail for video")
        //     const thumbnailLocation = await Compress.compressVideo(fileId, <Buffer>file?.buffer, 31, 20, 10);
        //     const publicId = fileId+".thumb.mp4";
        //     await GCP.upload(publicId, <Buffer>fs.readFileSync(thumbnailLocation));
        //     thumbnail = publicId;
        //     const snapshotPublicId = fileId+".snapshot.jpg";
        //     await GCP.upload(snapshotPublicId, <Buffer>fs.readFileSync("/tmp/"+snapshotPublicId));
        //     snapshot = snapshotPublicId;
        // }
        //
        // let timestamp = undefined;
        // if(metadata?.DateTimeOriginal) {
        //     const date =
        //         metadata?.DateTimeOriginal.split(" ")[0].replace(":", "-").replace(":", "-")
        //         +"T"
        //         +metadata?.DateTimeOriginal.split(" ")[1]
        //         +"Z"
        //
        //     console.log(date)
        //     timestamp = moment(date).toDate();
        // }
        // if(metadata?.format?.tags?.["com.apple.quicktime.creationdate"]) {
        //     console.log(metadata?.format?.tags?.["com.apple.quicktime.creationdate"])
        //     timestamp = moment(metadata?.format?.tags?.com?.apple?.quicktime?.creationdate).toISOString();
        // }
        // else if(metadata?.format?.tags?.creation_time) {
        //     timestamp = moment(metadata?.format?.tags?.creation_time).toDate();
        // }
        //
        // const media = new Models.Media({
        //     publicId: fileId+"."+(file?.mimetype.split("/")[0] === "video" ? "mp4" : "jpg"),
        //     // @ts-ignore
        //     original: req.file.filename,
        //     // @ts-ignore
        //     storageLocation: fileId+".thumb."+mime.extension(String(file.mimetype)),
        //     snapshot,
        //     // @ts-ignore
        //     type: req.file.mimetype,
        //     group: "event",
        //     user: req.user._id,
        //     thumbnail,
        //     metadata: JSON.parse(req.body.metadata),
        //     timestamp,
        //     event: event._id
        // });
        //
        // await media.save();
        //
        // event.media.push(media._id);
        // await event.save();
        //
        // res.status(202).json({
        //     message: "Media queued for upload",
        //     media: {
        //         publicId: media.publicId,
        //     }
        // });
        //
        // if(file?.mimetype.split("/")[0] === "video") {
        //     Logger("Uploading media to GCP")
        //     const storageLocation = await Compress.compressVideo(fileId, <Buffer>file?.buffer, 21, 30);
        //     await GCP.upload(fileId+".mp4", <Buffer>fs.readFileSync(storageLocation));
        //     media.storageLocation = fileId+".mp4";
        //     media.publicId = media.storageLocation
        // }
        // else if(file?.mimetype.split("/")[0] === "image") {
        //     Logger("Uploading media to GCP")
        //     const storageLocation = await Compress.compressImage(fileId, <Buffer>file?.buffer, 21);
        //     await GCP.upload(fileId+".jpg", <Buffer>fs.readFileSync(storageLocation));
        //     media.storageLocation = fileId+".jpg";
        //     media.publicId = media.storageLocation
        // }
        //
        // Logger("Completed")
        // await media.save();


        next(e);
    }

}



export async function getUploadedMedia (req: Request, res: Response, next: NextFunction) {
    try {


        if(!req.query?.gte) {
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

        if(!event) return res.sendStatus(404);

        const newMedia = await Models.Media.find({
            event: event._id,
            user: req.user._id,
            group: "event",
            createdAt: {
                $gte: moment(String(req.query?.gte)).toDate()
            }
        })
            .select("publicId")
            .sort({createdAt: 1});

        return res.json({
            media: newMedia.map(m => m.publicId),
            mediaCount: event.media.length
        });

    } catch(err) {
        console.log(err);
        next(err);
    }
}

export async function deleteMemories (req: Request, res: Response, next: NextFunction) {
    try {

        if(!(await Models.Event.countDocuments({
            _id: req.params.eventId,
            users: {
                $in: [req.user._id]
            }
        }))) return res.sendStatus(404);

        const media = await Models.Media.find({
            _id: {
                $in: req.body.ids
            },
            user: req.user._id,
        });

        console.log(media);

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
                await GCP.deleteFile(m.storageLocation);
                if(m.thumbnail) await GCP.deleteFile(m.thumbnail);
                if(m.snapshot) await GCP.deleteFile(m.snapshot);
                await Models.Media.deleteOne({
                    _id: m._id
                });
            }));
        } catch(Err) {
            console.log(Err);
        }


        await Models.Media.deleteMany({
            _id: {
                $in: media.map(m => m._id)
            },
            user: req.user._id,
        });


        return res.sendStatus(200);

    } catch(err) {
        next(err);
    }
}


