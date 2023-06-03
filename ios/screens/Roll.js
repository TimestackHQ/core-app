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
	StyleSheet
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
import AndroidRoll from "../Components/AndroidRoll";

export default function Roll () {

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

		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV6");
		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV60");
		//
		// await ExpoJobQueue.removeWorker("mediaQueueV6");
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
				ExpoJobQueue.addJob("mediaQueueV6", {
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
		if (Platform.OS === 'android') hasAndroidPermission();
	}, []);

	const onMediaPicked = async (event) => {
		const {itemDetails: item, picked} = Platform.OS === "ios" ? event.nativeEvent : event.reactEvent;

		console.log(item, picked)

		const selectedList = selected;
		const id = item.image.uri;

		if(picked) {
			selectedList[id] = item
		} else {
			delete selectedList[id]
		}

		setSelected(selectedList);

	}

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
			{Platform.OS === 'ios'
			?<TimestackCoreModule.TimestackCoreView onMediaPicked={onMediaPicked} style={{flex: 1}}/>
			:<AndroidRoll onMediaPicked={onMediaPicked} style={{flex: 1}}/>}
		</View>
	</View>
}


