import ExpoJobQueue from "expo-job-queue";
import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "./utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function uploadWorker () {
	try {

		ExpoJobQueue.addWorker("mediaQueueV3", async (media) => {
			return new Promise(async (resolve, reject) => {
				try {

					const mediaId = uuid.v4();

					const mediaList = [];

					if(media.type === "video") {
						const videoPath = await processVideo(mediaId, media.uri, 30, 10, 1080, 600);
						const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
						const snapshotPath = await generateScreenshot(mediaId, media.uri);
						mediaList.push(videoPath, thumbnailPath, snapshotPath);
					}

					else {
						const imagePath = await processPhoto(mediaId, media.uri, 10);
						const thumbnailPath = await processPhoto(mediaId+".thumbnail", media.uri, 41);
						mediaList.push(imagePath, thumbnailPath);
					}

					const formData = new FormData();
					formData.append('metadata', JSON.stringify(media.exif));
					formData.append('media', {uri: mediaList[0], name: mediaList[0].split("/").pop()});
					formData.append('thumbnail', {uri: mediaList[1], name: mediaList[1].split("/").pop()});
					if(media.type === "video") {
						formData.append('snapshot', {uri: mediaList[2], name: mediaList[2].split("/").pop()});
					}

					await axios.post(apiUrl+"/v1/media/" + media.eventId, formData, {
						headers: {
							authorization: "Bearer " + (await AsyncStorage.getItem("@session"))
						}
					});

					resolve(true);

				} catch (err) {

				}

			})
		}, {
			concurrency: 1,
		})
		ExpoJobQueue.cancelAllJobsForWorker("mediaQueueV2")
	} catch(err) {
		console.log(err);
	}

}