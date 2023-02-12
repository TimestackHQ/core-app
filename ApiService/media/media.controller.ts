import {NextFunction, Request, Response} from "express";
import {GCP, Logger, Models} from "../../shared";
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

        const fileId = uuid();

        if(file?.mimetype.split("/")[0] === "image") {

            const thumbnailBuffer = await sharp(<Buffer>file?.buffer)
                .resize(400)
                .jpeg()
                .toBuffer();

            Logger("Generating thumbnail for image")
            const publicId = fileId+".thumb."+mime.extension(file.mimetype);
            Logger("Uploading thumbnail to GCP")
            await GCP.upload(publicId, <Buffer>thumbnailBuffer);
            thumbnail = publicId;

        }

        if(file?.mimetype.split("/")[0] === "video") {
            Logger("Generating thumbnail for video")
            thumbnail = await new Promise((resolve, reject) => {
                fs.writeFileSync("/tmp/"+fileId, <Buffer>file?.buffer)
                Ffmpeg("/tmp/"+fileId)
                    .noAudio()
                    //mp4
                    .videoCodec('mpeg4')
                    .fps(20)
                    .videoBitrate(500)
                    .size('400x?')
                    .duration(10)
                    .output("/tmp/"+fileId+".thumb.mp4")
                    .on('end', async function() {
                        Logger("Uploading thumbnail to GCP")
                        const publicId = fileId+".thumb.mp4";
                        await GCP.upload(publicId, <Buffer>fs.readFileSync("/tmp/"+publicId));
                        resolve(publicId);
                    })
                    .on('error', function(err) {
                        console.log('an error happened: ' + err.message);
                        reject(err)
                    }).run();
            });

        }


        const publicId = fileId+"."+mime.extension(String(file?.mimetype));

        const media = new Models.Media({
            publicId,
            // @ts-ignore
            original: req.file.filename,
            // @ts-ignore
            storageLocation: thumbnail,
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

        Logger("Uploading media to GCP")
        media.storageLocation = await GCP.upload(publicId, <Buffer>file?.buffer);
        await media.save();


    } catch (e) {
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

        if(media?.thumbnail && req.query?.thumbnail == "true") {
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

        const file: Express.Multer.File | undefined = req.file;
        const fileId = uuid();

        let thumbnail: any;
        let metadata: any = JSON.parse(req.body?.metadata);

        if(file?.mimetype.split("/")[0] === "image") {

            const thumbnailBuffer = await sharp(<Buffer>file?.buffer)
                .resize(400)
                .jpeg()
                .toBuffer();

            Logger("Generating thumbnail for image")
            const publicId = fileId+".thumb."+mime.extension(file.mimetype);
            Logger("Uploading thumbnail to GCP")
            await GCP.upload(publicId, <Buffer>thumbnailBuffer);
            thumbnail = publicId
        }

        if(file?.mimetype.split("/")[0] === "video") {
            Logger("Generating thumbnail for video")
            thumbnail = await new Promise((resolve, reject) => {
                fs.writeFileSync("/tmp/"+fileId, <Buffer>file?.buffer)
                Ffmpeg("/tmp/"+fileId)
                    .noAudio()
                    //mp4
                    .videoCodec('mpeg4')
                    .fps(20)
                    .videoBitrate(500)
                    .size('?x600')
                    .duration(10)
                    .output("/tmp/"+fileId+".thumb.mp4")
                    .on('end', async function() {

                        Logger("Uploading thumbnail to GCP")
                        const publicId = fileId+".thumb.mp4";
                        await GCP.upload(publicId, <Buffer>fs.readFileSync("/tmp/"+publicId));
                        if(!metadata) await new Promise((resolve, reject) => {
                            fs.writeFileSync("/tmp/"+fileId, <Buffer>file?.buffer);
                            Ffmpeg.ffprobe("/tmp/"+fileId, function(err, metadataRaw) {
                                metadata = metadataRaw;
                                resolve(true);
                            });
                        });

                        resolve(publicId);
                    })
                    .on('error', function(err) {
                        console.log('an error happened: ' + err.message);
                        reject(err)
                    }).run();
            });

        };

        let timestamp = undefined;
        if(metadata?.DateTimeOriginal) {
            const date =
                metadata?.DateTimeOriginal.split(" ")[0].replace(":", "-").replace(":", "-")
                +"T"
                +metadata?.DateTimeOriginal.split(" ")[1]
                +"Z"

            console.log(date)
            timestamp = moment(date).toDate();
        }
        if(metadata?.format?.tags?.["com.apple.quicktime.creationdate"]) {
            console.log(metadata?.format?.tags?.["com.apple.quicktime.creationdate"])
            timestamp = moment(metadata?.format?.tags?.com?.apple?.quicktime?.creationdate).toDate();
        }
        else if(metadata?.format?.tags?.creation_time) {
            timestamp = moment(metadata?.format?.tags?.creation_time).toDate();
        }

        const publicId = fileId+"."+mime.extension(String(file?.mimetype));

        const media = new Models.Media({
            publicId,
            // @ts-ignore
            original: req.file.filename,
            // @ts-ignore
            storageLocation: fileId+".thumb."+mime.extension(String(file.mimetype)),
            // @ts-ignore
            type: req.file.mimetype,
            group: "event",
            user: req.user._id,
            thumbnail,
            metadata: JSON.parse(req.body.metadata),
            timestamp,
        });

        await media.save();

        event.media.push(media._id);
        await event.save();

        res.status(202).json({
            message: "Media queued for upload",
            media: {
                publicId: media.publicId,
            }
        });

        Logger("Uploading media to GCP")
        media.storageLocation = await GCP.upload(publicId, <Buffer>file?.buffer);
        await media.save();


    } catch (e) {
        next(e);
    }

}
