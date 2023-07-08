import ExpoJobQueue from "expo-job-queue";
import uuid from "react-native-uuid";
import { UploadItem } from "./types/global";
import { generateScreenshot, processPhoto, processVideo } from "./utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNHeicConverter from 'react-native-heic-converter';
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import moment from "moment";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Platform } from "react-native";
import * as TimestackCoreModule from "./modules/timestack-core";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default async function uploadWorker() {
	try {

		// await ExpoJobQueue.removeJob("mediaQueueV13");
		ExpoJobQueue.addWorker("mediaQueueV13", async (media: UploadItem) => {
			return new Promise(async (resolve, reject) => {
				try {

					console.log(media)
					console.log("------> ", media.uri, FileSystem.documentDirectory + media.filename);

					const mediaList = [];

					console.log(media.uri);

					if (Platform.OS === "ios") {
						if (media.type === "video") {
							console.log(await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type, 1080, 1080))
							const videoPath = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type, 1080, 1080)).compressedURL;
							const thumbnailPath = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), "image", 300)).compressedURL;
							mediaList.push(videoPath, thumbnailPath);
							console.log(mediaList);
						}

						else {
							console.log(await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type));
							const imagePath = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), media.type)).compressedURL;
							console.log(imagePath);
							const thumbnailPath = (await TimestackCoreModule.fetchImage(media.uri.replace("ph://", ""), "image", 600, 600)).compressedURL;
							mediaList.push(imagePath, thumbnailPath);
						}
					} else if (Platform.OS === "android") {

						await FileSystem.copyAsync({
							from: media.uri,
							to: FileSystem.documentDirectory + media.filename
						});
						media.uri = FileSystem.documentDirectory + media.filename;

						const mediaId = uuid.v4();

						if (media.type === "video") {
							const videoPath = await processVideo(mediaId, media.uri, 30, 0, 1080, 600);
							// const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
							const snapshotPath = await generateScreenshot(mediaId, media.uri);
							mediaList.push(
								videoPath,
								// videoPath
								// thumbnailPath, 
								snapshotPath
							);
							console.log(mediaList);
						}

						else {
							const imagePath = await processPhoto(mediaId, media.uri, 5, false);
							const thumbnailPath = await processPhoto(mediaId + ".thumbnail", media.uri, 5, true);
							mediaList.push(imagePath, thumbnailPath);
						}

						console.log(mediaList);

					}

					const formData = new FormData();
					formData.append('metadata', JSON.stringify({
						timestamp: media?.timestamp ? moment.unix(media?.timestamp) : undefined,
					}));
					// @ts-ignore
					formData.append('media', {
						uri: mediaList[0],
						name:
							Platform.OS === "ios" ? mediaList[0].split("/").pop() + String(media.type === "video" ? ".mp4" : ".jpeg") : mediaList[0].split("/").pop(),
						type: `image/${media.type === "video" ? "mp4" : "jpeg"}`
					});

					// @ts-ignore
					formData.append('thumbnail', {
						uri: mediaList[1],
						name:
							Platform.OS === "ios" ? mediaList[1].split("/").pop() + String(media.type === "video" ? ".mp4" : ".jpeg") : mediaList[1].split("/").pop(),
						type: `image/${media.type === "video" ? "mp4" : "jpeg"}`
					});

					formData.append('type', media.type === "video" ? "video/mp4" : "image/jpeg");

					try {
						const xhr = new XMLHttpRequest();

						let startTime = 0 // Start the timer;

						xhr.upload.addEventListener('progress', (event) => {
							console.log(event);
							if (event.lengthComputable) {
								const uploadedBytes = event.loaded;
								const uploadPercentage = (uploadedBytes / event.total) * 100;
								const currentTime = new Date().getTime();
								const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
								const uploadSpeed = uploadedBytes / elapsedTime; // Calculate speed in bytes per second

								// Convert to appropriate units
								const speedInKB = uploadSpeed / 1024;
								const speedInMB = speedInKB / 1024;

								console.log(
									`Upload progress: ${uploadPercentage.toFixed(2)}% - Speed: ${speedInMB.toFixed(
										2
									)} MB/s`
								);
							}
						});

						let endpoint = `${apiUrl}/v1/media/${media.holderId}`;

						if (media.holderType === "socialProfile") {
							endpoint += "?profile=true";
						}

						if (media.groupName) {
							endpoint += endpoint.includes("?") ? "&groupName=" + media.groupName : "?groupName=" + media.groupName;
						}

						xhr.open("POST", endpoint);
						xhr.setRequestHeader("authorization", `Bearer ${await AsyncStorage.getItem("@session")}`);
						xhr.onload = () => {
							console.log(xhr.response);
						};
						xhr.onerror = () => {
							console.log(xhr.statusText);
						};
						xhr.send(formData);

						startTime = new Date().getTime();

					} catch (err) {
						console.log(err);
					}

					resolve(true);

				} catch (err) {

					console.log("QUEUE ERROR", err);
					resolve(true);

				}

				resolve(true);

			})
		}, {
			concurrency: 1,

		})
	} catch (err) {
		console.log(err);
	}

}