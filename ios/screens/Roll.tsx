import {
	TouchableOpacity,
	View,
	Text,
	Platform,
	Alert, PermissionsAndroid,
} from "react-native";
import { useEffect, useState } from "react";
import * as React from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import moment from "moment";
import { v4 } from "uuid";
import * as Network from "expo-network";
import { NetworkStateType } from "expo-network";
import * as TimestackCoreModule from "../modules/timestack-core";
import AndroidRoll from "../Components/AndroidRoll";
import { UploadItem } from "../types/global";

export default function Roll() {

	const navigator = useNavigation();
	const route = useRoute<RouteProp<{
		params: {
			eventId: string,
		}
	}>>()

	const [selected, setSelected] = useState({});
	const [selectionCounter, setSelectionCounter] = useState(0);

	async function hasAndroidPermission() {

		const checkPermission = async (permission) => {
			const hasPermission = await PermissionsAndroid.check(permission);
			if (hasPermission) {
				return true;
			}

			const status = await PermissionsAndroid.request(permission);
			return status === 'granted';
		}

		if (Number(Platform.Version) >= 33) {
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
		}
		await checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
	}




	const save = async () => {

		const mediaSelected = [];

		Object.values(selected).forEach((item) => mediaSelected.push(item));

		console.log(mediaSelected);

		const upload = async () => {
			for await (const media of mediaSelected) {

				console.log("payload:", {
					uri: media.image.uri,
					type: media.type,
					eventId: route.params.eventId
				})
				ExpoJobQueue.addJob<UploadItem>("mediaQueueV9", {
					filename: moment().unix() + "_" + v4() + "." + media.image.extension,
					extension: media.image.extension,
					uri: media.image.uri,
					type: media.type,
					eventId: route.params.eventId,
					playableDuration: media.image.playableDuration,
					timestamp: media.timestamp,
					location: media.location,
					filesize: media.image.filesize,
				})

			}

			await ExpoJobQueue.start();

			console.log("JOB_QUEUE_STARTED")

			navigator.goBack();
		}
		const net = await Network.getNetworkStateAsync();
		if (net.type === NetworkStateType.CELLULAR) {
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

		const selectedList = selected;
		const { itemDetails: item } = Platform.OS === "ios" ? event.nativeEvent : event.reactEvent;

		console.log("ITEM PICKED FROM ROLL", item)

		const id = item.image.uri;

		if (selectedList?.[id]) {
			delete selectedList[id]
			setSelectionCounter(selectionCounter - 1);
		} else {
			selectedList[id] = item
			setSelectionCounter(selectionCounter + 1);
		}

		setSelected(selectedList);

	}

	return <View style={{ flex: 1, flexDirection: "column" }}>
		{/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', padding: 10 }}>
			<TouchableOpacity onPress={save}>
				<Text style={{
					fontSize: 15,
					fontFamily: "Red Hat Display Semi Bold",
				}}>Upload</Text>
			</TouchableOpacity>
		</View> */}
		<View style={{ flex: 25, alignContent: "center", justifyContent: "center", flexDirection: "row" }}>
			{selectionCounter !== 0 ? <TouchableOpacity style={{
				flex: 2,
				zIndex: 3,
				position: "absolute",
				bottom: 50,
				width: "90%",
				height: 50,
				marginHorizontal: 200,
				backgroundColor: "#F2F2F2",
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 25,
				shadowColor: 'black',
				shadowOffset: {
					width: 0,
					height: 40,
				},
				shadowOpacity: 1,
				shadowRadius: 30,
				elevation: 5,
			}} onPress={save}>
				<Text style={{
					fontSize: 20,
					fontFamily: "Red Hat Display Semi Bold",
					zIndex: 3,
					color: "black",
				}}>Add {selectionCounter} {selectionCounter !== 1 ? "memories" : "memory"}</Text>
			</TouchableOpacity> : null}
			{/* <View style={{
				flex: 2,
				position: "absolute",
				bottom: 50,
				width: '90%',
				height: 50,
				zIndex: 2, shadowColor: 'black',
				shadowOffset: {
					width: 10,
					height: -10,
				},
				shadowOpacity: 0.4,
				shadowRadius: 20,
				elevation: 5,
			}} /> */}
			<View style={{ zIndex: 1, flex: 1 }}>
				{Platform.OS === 'ios'
					? <TimestackCoreModule.TimestackCoreView onMediaPicked={onMediaPicked} style={{ flex: 1 }} />
					: <AndroidRoll onMediaPicked={onMediaPicked} />}
			</View>
		</View>
	</View >
}


