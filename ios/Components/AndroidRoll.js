import {
	FlatList,
	Image,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Text,
	Platform,
	Linking,
	Animated,
	VirtualizedList,
	Alert, SafeAreaView, ActivityIndicator, PermissionsAndroid,
	StyleSheet,
	Dimensions
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import FadeIn from 'react-native-fade-in-image';
import {useEffect, useState, Component, } from "react";
import {CameraRoll} from "@react-native-camera-roll/camera-roll";
import FastImage from "react-native-fast-image";
import * as React from "react";
import {useNavigation, useRoute} from "@react-navigation/native";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import * as FileSystem from 'expo-file-system';
import uploadWorker from "../uploadWorker";
import moment from "moment";
import {v4} from "uuid";
import * as Network from "expo-network";
import {NetworkStateType} from "expo-network";
import * as TimestackCoreModule from "../modules/timestack-core";

const width = Dimensions.get("window").width;

function formatDuration(durationInSeconds) {
	if(!durationInSeconds) return "";
	const hours = Math.floor(durationInSeconds / 3600);
	const minutes = Math.floor((durationInSeconds - hours * 3600) / 60);
	const seconds = Math.floor(durationInSeconds - hours * 3600 - minutes * 60);

	let formattedDuration = "";

	if (hours > 0) {
		const formattedHours = hours.toString().padStart(2, '0');
		formattedDuration += `${formattedHours}:`;
	}

	const formattedMinutes = minutes.toString().padStart(2, '0');
	const formattedSeconds = seconds.toString().padStart(2, '0');

	formattedDuration += `${formattedMinutes}:${formattedSeconds}`;
	return formattedDuration;
}

export default function AndroidRoll ({onMediaPicked}) {

	const navigator = useNavigation();
	const route = useRoute()

	const [media, setMedia] = useState([]);
	const [cursor, setCursor] = useState(undefined);
	const [selected, setSelected] = useState({});

	async function hasAndroidPermission() {

		const checkPermission = async (permission) => {
			const hasPermission = await PermissionsAndroid.check(permission);
			if (hasPermission) {
				return true;
			}

			const status = await PermissionsAndroid.request(permission);
			return status === 'granted';
		}

		if(Platform.Version >= 33) {
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
		}
		await checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
	}

	


	const save = async () => {

		// return; 
		const mediaSelected = [];

		Object.values(selected).forEach((item) => mediaSelected.push(item));

		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV47");
		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV470");
		//
		// await ExpoJobQueue.removeWorker("mediaQueueV47");
		// await uploadWorker();

		console.log(mediaSelected);

		const upload = async () => {
			for await (const media of mediaSelected) {

				//
				console.log("payload:",{
					uri: media.image.uri,
					type: media.type,
					eventId: route.params.eventId
				})
				ExpoJobQueue.addJob("mediaQueueV47", {
					filename: moment().unix()+"_"+v4()+"."+media.image.extension,
					extension: media.image.extension,
					uri: media.image.uri,
					type: media.type.includes("video") ? "video" : "image",
					eventId: route.params.eventId,
					playableDuration: media.image.playableDuration,
					timestamp: media.timestamp,
					location: media.location,
					fileSize: media.image.fileSize,
				})

			}

			await ExpoJobQueue.start();

			console.log("JOB_QUEUE_STARTED")

			navigator.goBack();
		}
		const net = await Network.getNetworkStateAsync();
		if(net.type === NetworkStateType.CELLULAR) {
			Alert.alert("Cellular Upload", `Do you want to upload ${mediaSelected.length} items over cellular?`, [
				{
					text: "Cancel",
					onPress: () => navigator.goBack(),
				}, {
					text: "OK",
					onPress: upload

			}]);

		} else {
			await upload();
		}

	}

	useEffect(() => {
		hasAndroidPermission();

		(async () => {
			const images = await CameraRoll.getPhotos({
				first: 200,
				assetType: 'Photos',
			});
			// console.log(images.edges)
			setMedia(images.edges);
			setCursor(images.page_info.end_cursor);
		})();
	}, []);

	return <View style={{flex: 1}}>
			<FlashList

				onEndReached={() => {
					if (cursor)
						CameraRoll.getPhotos({
							first: 200,
							after: cursor,
							assetType: 'Photos',
						}).then((res) => {
							setMedia([...media, ...res.edges]);
							setCursor(res.page_info.end_cursor);
						});
					}
				}
				data={media}
				initialNumToRender={200}
				estimatedItemSize={100}
				numColumns={3}
				renderItem={({item}) => {
					return <View style={{flex: 1, flexDirection: "column", margin: 1}}>
						<TouchableOpacity onPress={() => {
                            let selected = true;
                            if(selected[item.node.image.uri]) {
                                selected = false;
                                setSelected({...selected, [item.node.image.uri]: false})
                            } {
                                setSelected({...selected, [item.node.image.uri]: true})
                            }
                                
                            onMediaPicked({
                                reactEvent: {
                                    itemDetails: {
                                        image: {
                                            extension: item.node.image.extension,
                                            uri: item.node.image.uri,
                                            playableDuration: item.node.image.playableDuration,
                                            fileSize: item.node.image.fileSize,
                                        },
                                        type: item.node.type.includes("video") ? "video" : "image",
                                        timestamp: item.node.timestamp
                                    },
                                    picked: selected
                                }
                            })
                        }}>
                            <FastImage
                                style={{width: width/3, height: width/3}}
                                source={{uri: item.node.image.uri}}
                            />
                        </TouchableOpacity>
						
						</View>	
				}}

				keyExtractor={(item, index) => index.toString()}
				onEndReachedThreshold={3}
			/>

		</View>
}


