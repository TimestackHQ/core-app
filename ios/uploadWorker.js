import ExpoJobQueue from "expo-job-queue";
import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "./utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNHeicConverter from 'react-native-heic-converter';
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import moment from "moment";
import {CameraRoll} from "@react-native-camera-roll/camera-roll";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default async function uploadWorker () {
	try {

			await ExpoJobQueue.addWorker("mediaQueueV20", async (media) => {
			return new Promise(async (resolve, reject) => {
				try {
					console.log("------> ", media.uri, FileSystem.documentDirectory + media.filename);

					// if(media.extension === "heic") {
						const dev = await CameraRoll.iosGetImageDataById(media.uri);
						media.uri = dev.node.image.filepath;
					// } else {
					// 	await FileSystem.copyAsync({
					// 		from: media.uri,
					// 		to: FileSystem.documentDirectory + media.filename
					// 	});
					// 	media.uri = FileSystem.documentDirectory + media.filename;
					//
					// }

					// console.log("IOS_PATH", dev);




					if(media.extension === "heic") {
						const converted = await RNHeicConverter.convert({
							path: media.uri
						});

						media.uri = converted.path;
						media.extension = "jpg";
					} else {
					}



					const mediaId = uuid.v4();

					const mediaList = [];

					if(media.type === "video") {
						const videoPath = await processVideo(mediaId, media.uri, 30, 0, 1080, 600);
						const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
						const snapshotPath = await generateScreenshot(mediaId, media.uri);
						mediaList.push(videoPath, thumbnailPath, snapshotPath);
						console.log(mediaList);
					}

					else {
						const imagePath = await processPhoto(mediaId, media.uri, 10, false);
						const thumbnailPath = await processPhoto(mediaId+".thumbnail", media.uri, 10, true);
						mediaList.push(imagePath, thumbnailPath);
					}

					const formData = new FormData();
					formData.append('metadata', JSON.stringify({
						timestamp: media?.timestamp ? moment.unix(media?.timestamp) : undefined,
					}));
					formData.append('media', {uri: mediaList[0], name: mediaList[0].split("/").pop()});
					formData.append('thumbnail', {uri: mediaList[1], name: mediaList[1].split("/").pop()});
					if(media.type === "video") {
						formData.append('snapshot', {uri: mediaList[2], name: mediaList[2].split("/").pop()});
					}

					try {
						axios.post(apiUrl+"/v1/media/" + media.eventId, formData, {
							headers: {
								authorization: "Bearer " + (await AsyncStorage.getItem("@session"))
							}
						})
							.then((res) => {
								console.log(res.data);
							})
							.catch((err) => {
								console.log(err);
							})

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
	} catch(err) {
		console.log(err);
	}

}