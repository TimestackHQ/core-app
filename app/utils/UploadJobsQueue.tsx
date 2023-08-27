import { UploadItem } from "../types/global";
import { ColumnMapping, columnTypes, IStatement, Repository, sql, Migrations } from "expo-sqlite-orm";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as TimestackCoreModule from "../modules/timestack-core";
import uuid from "react-native-uuid";
import { generateScreenshot, processPhoto, processVideo } from "./compression";
import moment from "moment/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "./io";
import axios from "axios";
import { TimestackCoreNativeCompressionListener } from "../modules/timestack-core";
import * as React from "react";

export interface UploadItemJob {
    id: string,
    item: UploadItem,
    holderId: string,
    status: "pending" | "processing" | "failed"
}

export interface CompressionProgressEvent {
    itemId: string
    progress: number,
}

const databaseName = 'queueDatabase1';

export class UploadJobsRepository extends Repository<UploadItemJob> {

    private status: "running" | "stopped" = "stopped";
    private fetchingPendingUpload = false;
    private connected = false;


    constructor() {
        const columMapping: ColumnMapping<UploadItemJob> = {
            id: { type: columnTypes.TEXT, default: () => String(Date.now()) },
            item: { type: columnTypes.JSON, default: () => ({}) },
            status: { type: columnTypes.TEXT, default: () => "pending" },
            holderId: { type: columnTypes.TEXT },
        }
        super(databaseName, 'uploads', columMapping)
    }

    async init() {
        const statements: IStatement = {
            '1662688376199_create_table_uploads': sql`
		CREATE TABLE IF NOT EXISTS uploads (
			id TEXT PRIMARY KEY,
			item JSON NOT NULL,
			status TEXT NOT NULL,
			holderId TEXT NOT NULL
		);
	`,
        }

        const migrations = new Migrations(databaseName, statements);
        await migrations.migrate();

        console.log("Registering compression listener...")
        TimestackCoreNativeCompressionListener(async (eventRaw) => {

            const event: CompressionProgressEvent = eventRaw;
            const percentage = Number(Number(event.progress).toFixed(0));

            console.log(event)

            // const upload = await this.query({
            //     where: {id: {equals: event.itemId}},
            //     limit: 1
            // });
            //
            // console.log("hey", upload)
            //
            // if(!upload) return;
            // if(percentage !== 100) await this.updateUpload(event.itemId, "processing", {
            //     ...upload[0].item,
            //     compressionProgress: percentage
            // });
            //
            // const after = await this.find(event.itemId)
            //
            //
            // console.log("after", after.item.compressionProgress)
        })



    }

    async updateUpload(id: string, status: UploadItemJob['status'], item: UploadItemJob['item']) {
        return this.update({
            id,
            status,
            item,
            holderId: item.holderId
        });
    }

    async deleteUpload(id: string) {
        return this.destroy(id);
    }

    async clearUploads() {
        return this.destroyAll();
    }

    async clearAllProcessingUploads() {
        const uploads = await this.query({ where: { status: { equals: "processing" } } });
        for (const upload of uploads) {
            await this.updateUpload(upload.id, "pending", upload.item);
        }
    }

    async getOnePendingUpload(): Promise<UploadItemJob> {
        const response = await this.query({ where: { status: { equals: "pending" } }, limit: 1 });
        // alert(JSON.stringify(response));
        return response[0];
    }

    async getAllJobs(): Promise<UploadItemJob[]> {
        return this.query({});
    }

    runQueueWatcher() {
        const interval = setInterval(async () => {

            if (this.fetchingPendingUpload || this.status === "stopped") return;

            this.fetchingPendingUpload = true;

            const pendingJob = await this.getOnePendingUpload();

            if (pendingJob) {
                await this.runJob(pendingJob);
            }

            this.fetchingPendingUpload = false;

        }, 1000);

        return () => clearInterval(interval);
    }

    startQueue() {
        this.status = "running";
    }

    addJob(job: UploadItemJob) {
        return this.insert(job);
    }

    stopQueue() {
        this.status = "stopped";
    }

    private async runJob(job: UploadItemJob) {

        const media = job.item;

        try {

            await this.updateUpload(job.id, "processing", job.item);

            console.log("------> ", media.uri, FileSystem.documentDirectory + media.filename);

            const mediaList: string[] = [];


            if (Platform.OS === "ios") {
                if (media.type === "video") {

                    const video = await TimestackCoreModule.fetchImage(job.id, media.uri.replace("ph://", ""), media.type, 1080, 1080)

                    const videoPath: string = video.compressedURL;
                    const thumbnailPath: string = (await TimestackCoreModule.fetchImage(job.id, media.uri.replace("ph://", ""), "image", 300)).compressedURL;

                    mediaList.push(videoPath, thumbnailPath);
                }

                else {
                    const image = await TimestackCoreModule.fetchImage(job.id, media.uri.replace("ph://", ""), media.type)
                    const imagePath: string = image.compressedURL;
                    const thumbnailPath: string = (await TimestackCoreModule.fetchImage(job.id, media.uri.replace("ph://", ""), "image", 600, 600)).compressedURL;

                    mediaList.push(imagePath, thumbnailPath);
                }
            } else if (Platform.OS === "android") {
                //
                // await FileSystem.copyAsync({
                //     from: media.uri,
                //     to: FileSystem.documentDirectory + media.filename
                // });
                // media.uri = FileSystem.documentDirectory + media.filename;
                //
                // const mediaId = uuid.v4();
                //
                // if (media.type === "video") {
                //     const videoPath = await processVideo(mediaId, media.uri, 30, 0, 1080, 600);
                //     // const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
                //     const snapshotPath = await generateScreenshot(mediaId, media.uri);
                //     mediaList.push(
                //         videoPath,
                //         // videoPath
                //         // thumbnailPath,
                //         snapshotPath
                //     );
                //     console.log(mediaList);
                // }
                //
                // else {
                //     const imagePath = await processPhoto(mediaId, media.uri, 5, false);
                //     const thumbnailPath = await processPhoto(mediaId + ".thumbnail", media.uri, 5, true);
                //     mediaList.push(imagePath, thumbnailPath);
                // }
                //
                // console.log(mediaList);

            }


            const isAvailable = await Promise.all(
                mediaList.map(async (mediaPath) => {
                    try {
                        const { exists } = await FileSystem.getInfoAsync(mediaPath);
                        return exists;
                    } catch (error) {
                        console.log('Error checking media:', error);
                        return false;
                    }
                })
            );

            const allAvailable = isAvailable.every((available) => available);

            if (!allAvailable) {
                alert("Error: Some media is missing");
                throw new Error("Some media is missing");
            }

            const upload = await TimestackCoreModule.uploadFile(
                {
                    mediaFile: mediaList[0],
                    mediaThumbnail: mediaList[1],
                },
                `${apiUrl}/v1/media`,
                "POST",
                {
                    Authorization: `Bearer ${await AsyncStorage.getItem('@session')}`,
                },
                {
                    holderId: media.holderId,
                    holderType: media.holderType,
                    mediaQuality: "high",
                    mediaFormat: media.type === "video" ? "mp4" : "jpeg",
                    uploadLocalDeviceRef: media.groupName
                }
            );

            console.log("Result", upload);

        } catch (err) {

            console.log("QUEUE ERROR", err);

        }

        await this.deleteUpload(job.id);


    }

}
