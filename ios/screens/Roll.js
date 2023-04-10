import {
	FlatList,
	Image,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Text,
	Platform,
	Linking,
	Alert, SafeAreaView, ActivityIndicator, PermissionsAndroid
} from "react-native";
import {useEffect, useState} from "react";
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

export default function Roll () {

	const navigator = useNavigation();
	const route = useRoute()

	const [media, setMedia] = useState([]);
	const [cursor, setCursor] = useState(undefined);
	const [selected, setSelected] = useState([]);

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

	const getMedia = async (initial) => {

		await hasAndroidPermission()

		const newMedia = await CameraRoll.getPhotos({
			first: initial ? 300 : 150,
			after: cursor,
		});

		setMedia([...media, ...newMedia.edges]);
		setCursor(newMedia.page_info?.end_cursor);
	}

	const save = async () => {
		const mediaSelected = [];

		selected.map((uri) => {
			const file = media.find((media) => media.node.image.uri === uri);
			mediaSelected.push(file.node);
		});

		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV30");
		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV300");
		//
		// await ExpoJobQueue.removeWorker("mediaQueueV30");
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
				ExpoJobQueue.addJob("mediaQueueV30", {
					filename: moment().unix()+"_"+v4()+"."+media.image.extension,
					extension: media.image.extension,
					uri: media.image.uri,
					type: media.type,
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
		getMedia(true).then((err) => {
			console.log(err)


		})
			.catch((err) => {
				Alert.alert("Permission", "Please allow access to your photos and videos in order to upload them.", [
					{
						text: "Cancel",
						onPress: () => navigator.goBack(),
					}, {
						text: "OK",
						onPress: () => {
							navigator.goBack();
							if (Platform.OS === 'ios') {
								Linking.openURL('app-settings:');
							} else {
								Linking.openSettings();
							}
						}

					}]);
			})

	}, []);

	return <View style={{flex: 1, flexDirection: "column"}}>
		<View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', padding: 10}}>
			<TouchableOpacity onPress={save}>
				<Text style={{
					fontSize: 15,
					fontFamily: "Red Hat Display Semi Bold",
				}}>Upload</Text>
			</TouchableOpacity>
		</View>
		<View style={{flex: 25}}>
			<FlatList
				data={media}
				numColumns={3}
				onEndReached={getMedia}
				onEndReachedThreshold={1.5}
				renderItem={({item}) => <View style={{flex: 5, width: "33%", height: 120, margin: 1, backgroundColor: "#dedede"}}
				>
					<View style={{
						position: 'absolute',
						left: 5,
						bottom: 3,
						zIndex: 1,
						backgroundColor: 'transparent',
					}}>
						<Text style={{
							fontSize: 16,
							fontFamily: "Red Hat Display Semi Bold",
							color: "white",
							textShadowColor: 'black',
							textShadowRadius: 5,
						}}>
							{formatDuration(item.node.image.playableDuration)}
						</Text>
					</View>
					{selected.includes(item.node.image.uri) ? <View
						style={{
							position: 'absolute',
							right: 5,
							bottom: 5,
							zIndex: 1,
							backgroundColor: 'transparent',
						}}
					>
						<Image
							source={require("../assets/icons/select.png")}
							style={{width: 20, height: 20, opacity: 1, borderWidth: 1,borderColor: "white", borderRadius: 10}}
						/>
					</View> : null}
					<TouchableWithoutFeedback onPress={() => {
						if (selected.includes(item.node.image.uri)) {
							setSelected(selected.filter((uri) => uri !== item.node.image.uri));
						}
						else {
							setSelected([...selected, item.node.image.uri]);
						}
					}}>

						<Image
							source={{uri: item.node.image.uri}}
							style={{width: "100%", height: "100%", margin: 0.5,
								opacity: selected.includes(item.node.image.uri) ? 0.5 : 1}}
						/>
					</TouchableWithoutFeedback>
				</View>}
				// ListFooterComponent={() => <SafeAreaView>
				// 	<ActivityIndicator color={"black"} animating={cursor ? true : false} style={{marginTop: 5}} />
				// </SafeAreaView>}
			/>
		</View>
	</View>
}