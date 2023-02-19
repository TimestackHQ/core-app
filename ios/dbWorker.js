import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "./utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function DBWorker (db) {

	db.transaction(tx => {
		tx.executeSql(
			"CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, media TEXT, eventId INTEGER, failedCounter INTEGER, locker BOOLEAN);"
		);
	});

	setInterval(() => {
		db.transaction(tx => {
			// create table that has an id, a media, eventId, failedCounter, and a locker


			// get all content from media table
			tx.executeSql(
				"SELECT * FROM media WHERE locker = ?, failedCounter < 3",
				[false],
				(_, { rows: { _array } }) => {
					_array.forEach(async (mediaRaw) => {

						try {
							const media = JSON.parse(mediaRaw.media);

							db.transaction(tx => {
								tx.executeSql(
									"UPDATE media SET locker = ? WHERE id = ?",
									[true, mediaRaw.id]
								);
							});

							const mediaId = uuid.v4();

							const mediaList = [];

							if(media.type === "video") {
								const videoPath = await processVideo(mediaId, media.uri, 30, 10, 1080);
								const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
								const snapshotPath = await generateScreenshot(mediaId, media.uri);
								mediaList.push(videoPath, thumbnailPath, snapshotPath);
							}

							else {
								const imagePath = await processPhoto(mediaId, media.uri, 10);
								const thumbnailPath = await processPhoto(mediaId+".thumbnail", media.uri, 41);
								mediaList.push(imagePath, thumbnailPath);
							}


							try {

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

								db.transaction(tx => {
									tx.executeSql(
										"DELETE FROM media WHERE id = ?",
										[mediaRaw.id]
									);
								});

							} catch (err) {
								console.log(err, "err")

								if(mediaRaw.failedCounter > 3) {
									db.transaction(tx => {
										tx.executeSql(
											"DELETE FROM media WHERE id = ?",
											[mediaRaw.id]
										);
									});
									return;
								}
								db.transaction(tx => {
									tx.executeSql(
										"UPDATE media SET failedCounter = ?, locker = ? WHERE id = ?",
										[mediaRaw.failedCounter + 1, false, mediaRaw.id]
									);
								})
							}
						} catch (err) {
							db.transaction(tx => {
								tx.executeSql(
									"DELETE FROM media WHERE id = ?",
									[mediaRaw.id]
								);
							});
						}


					});
				}
			);
		});

	}, 5000);



}
