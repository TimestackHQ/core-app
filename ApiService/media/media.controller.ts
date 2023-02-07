import {NextFunction, Request, Response} from "express";
import {Models, GCP, Logger} from "../../shared";
import {v4 as uuid} from 'uuid';
import * as mime from "mime-types";
import * as imageThumbnail from "image-thumbnail";
// @ts-ignore
import * as Ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
const bucket = GCP.storage.bucket(String(process.env.GCP_STORAGE_BUCKET));

export async function uploadCover (req: Request, res: Response, next: NextFunction) {

    try {

        const file: Express.Multer.File | undefined = req.file;

        const publicId = uuid()+"."+mime.extension(<string>file?.mimetype);

        let options = { width: 400, height: 600, responseType: 'base64' }
        // @ts-ignore
        const thumbnail = await imageThumbnail(<Buffer>file?.buffer, options);

        const blob = bucket.file(publicId);
        const blobStream = blob.createWriteStream({
            resumable: false
        });

        blobStream.on('finish', async () => {
            const publicUrl =
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`

            // @ts-ignore

            const media = new Models.Media({
                publicId,
                // @ts-ignore
                original: req.file.filename,
                storageLocation: publicUrl,
                // @ts-ignore
                type: req.file.mimetype,
                group: "cover",
                user: req.user._id,
                thumbnail: "data:image/png;base64,"+thumbnail
            });

            await media.save();

            res.status(200).json({
                message: "Cover uploaded successfully",
                media: {
                    publicId: media.publicId,
                    storageLocation: media.storageLocation,
                },
            });
        })
        .on('error', () => {
            res.sendStatus(500)
        })
        .end(file?.buffer);



    } catch (e) {
        next(e);
    }

}

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {publicId} = req.params;
        const media = await Models.Media.findOne({
            publicId,
            group: "event",
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

        let thumbnail: any;

        const fileId = uuid();

        if(file?.mimetype.split("/")[0] === "image") {
            Logger("Generating thumbnail for image")
            let options = { width: 400, height: 600, responseType: 'base64' }
            // @ts-ignore
            const thumbnailBuffer = await imageThumbnail(<Buffer>file?.buffer, options);
            const publicId = fileId+".png";
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
                    .fps(24)
                    .videoBitrate(1000)
                    .videoFilters('scale=400:600')
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

        res.status(202).json({
            message: "Media queued for upload",
        });

        Logger("Uploading media to GCP")
        const publicId = fileId+"."+mime.extension(String(file?.mimetype));
        const publicUrl = await GCP.upload(publicId, <Buffer>file?.buffer);

        const media = new Models.Media({
            publicId,
            // @ts-ignore
            original: req.file.filename,
            storageLocation: publicUrl,
            // @ts-ignore
            type: req.file.mimetype,
            group: "event",
            user: req.user._id,
            thumbnail
        });

        await media.save();

        event.media.push(media._id);
        await event.save();

    } catch (e) {
        next(e);
    }

}
