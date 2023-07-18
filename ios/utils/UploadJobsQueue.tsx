import {UploadItem} from "../types/global";
import {ColumnMapping, columnTypes, IStatement, Repository, sql, Migrations} from "expo-sqlite-orm";
import * as FileSystem from "expo-file-system";
import {Platform} from "react-native";
import * as TimestackCoreModule from "../modules/timestack-core";
import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "./compression";
import moment from "moment/moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {apiUrl} from "./io";
import axios from "axios";

export interface UploadItemJob {
    id: string,
    item: UploadItem,
    holderId: string,
    status: "pending" | "processing" | "failed"
}

const databaseName = 'queueDatabase';

export class UploadJobsRepository extends Repository<UploadItemJob> {

    private status: "running" | "stopped" = "stopped";
    private fetchingPendingUpload = false;


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

        const migrations = new Migrations(databaseName, statements)
        await migrations.migrate()
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
        const uploads = await this.query({ where: {status: {equals: "processing"}}});
        for(const upload of uploads) {
            await this.updateUpload(upload.id, "pending", upload.item);
        }
    }

    async getOnePendingUpload(): Promise<UploadItemJob> {
        const response = await this.query({ where: {status: {equals: "pending"}}, limit: 1});
        // alert(JSON.stringify(response));
        return response[0];
    }

    async getAllJobs(): Promise<UploadItemJob[]> {
        return this.query({});
    }

    runQueueWatcher() {
        const interval = setInterval(async () => {

            console.log("running queue watcher");

            if(this.fetchingPendingUpload || this.status === "stopped") return;

            this.fetchingPendingUpload = true;

            const pendingJob = await this.getOnePendingUpload();

            if(pendingJob) {
                console.log("running job", pendingJob.item.uri);
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

    private async runJob (job: UploadItemJob) {

        const media = job.item;

        let waitingInterval;
        try {

            await this.updateUpload(job.id, "processing", job.item);

            console.log(media)
            console.log("------> ", media.uri, FileSystem.documentDirectory + media.filename);

            const mediaList: string[] = [];

            console.log(media.uri);

            if (Platform.OS === "ios") {
                if (media.type === "video") {

                    const waitingInterval = setInterval(() => {
                        console.log("waiting for video to be processed", media.uri);
                    }, 1000);

                    const video = await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type, 1080, 1080)

                    console.log(video)
                    const videoPath: string = video.compressedURL;
                    const thumbnailPath: string = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), "image", 300)).compressedURL;
                    mediaList.push(videoPath, thumbnailPath);
                    console.log(mediaList);
                }

                else {
                    const image = await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type)
                    console.log(image);
                    const imagePath: string = image.compressedURL;
                    console.log(imagePath);
                    const thumbnailPath: string = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), "image", 600, 600)).compressedURL;

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

            console.log("GOT FILE>>>><<<<");

            const formData = new FormData();
            formData.append('metadata', JSON.stringify({
                timestamp: media?.timestamp ? moment.unix(media?.timestamp) : undefined,
            }));

            formData.append('media', {
                // @ts-ignore
                uri: mediaList[0],
                name:
                    Platform.OS === "ios" ? mediaList[0].split("/").pop() + String(media.type === "video" ? ".mp4" : ".jpeg") : mediaList[0].split("/").pop(),
                type: `image/${media.type === "video" ? "mp4" : "jpeg"}`,
            });

            formData.append('thumbnail', {
                // @ts-ignore
                uri: mediaList[1],
                name:
                    Platform.OS === "ios" ? mediaList[1].split("/").pop() + String(media.type === "video" ? ".mp4" : ".jpeg") : mediaList[1].split("/").pop(),
                type: `image/${media.type === "video" ? "mp4" : "jpeg"}`,
            });

            formData.append('type', media.type === "video" ? "video/mp4" : "image/jpeg");

            try {

                let startTime = new Date().getTime();

                const config = {
                    onUploadProgress: (progressEvent) => {
                        console.log(progressEvent);
                        if (progressEvent.lengthComputable) {
                            const uploadedBytes = progressEvent.loaded;
                            const uploadPercentage = (uploadedBytes / progressEvent.total) * 100;
                            const currentTime = new Date().getTime();
                            const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
                            const uploadSpeed = uploadedBytes / elapsedTime; // Calculate speed in bytes per second

                            // Convert to appropriate units
                            const speedInKB = uploadSpeed / 1024;
                            const speedInMB = speedInKB / 1024;

                            console.log(
                                `Upload progress: ${uploadPercentage.toFixed(2)}% - Speed: ${speedInMB.toFixed(2)} MB/s`
                            );
                        }
                    },
                    headers: {
                        'authorization': `Bearer ${await AsyncStorage.getItem("@session")}`,
                        'Content-Type': 'multipart/form-data',
                    },
                };

                let endpoint = `${apiUrl}/v1/media/${media.holderId}`;

                if (media.holderType === "socialProfile") {
                    endpoint += "?profile=true";
                }

                if (media.groupName) {
                    endpoint += endpoint.includes("?") ? "&groupName=" + media.groupName : "?groupName=" + media.groupName;
                }

                const response = await axios.post(endpoint, formData, config);
                console.log(response.data);

                startTime = new Date().getTime();
            } catch (error) {
                console.log(error);
            }


        } catch (err) {

            console.log("QUEUE ERROR", err);

        }

        await this.deleteUpload(job.id);


    }

}