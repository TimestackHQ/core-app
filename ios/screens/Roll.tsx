import {
	TouchableOpacity,
	View,
	Text,
	Platform,
	Alert, PermissionsAndroid,
} from "react-native";
import { useEffect, useState } from "react";
import * as React from "react";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import moment from "moment";
import { v4 } from "uuid";
import * as Network from "expo-network";
import { NetworkStateType } from "expo-network";
import * as TimestackCoreModule from "../modules/timestack-core";
import AndroidRoll from "../Components/AndroidRoll";
import { UploadItem } from "../types/global";
import { useAppDispatch } from "../store/hooks";
import { setRoll } from "../store/rollState";
import { RootStackParamList } from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";

export default function Roll() {

	const navigator = useNavigation();
	const route = useRoute<RouteProp<RootStackParamList, "Roll">>()

	const [selected, setSelected] = useState({});
	const [selectionCounter, setSelectionCounter] = useState(0);

	const dispatch = useAppDispatch();

	const isFocused = useIsFocused();

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

	useEffect(() => {
		console.log("Hey", route.params);
		if (isFocused) {
			dispatch(setRoll({
				...route.params
			}));
			setTimeout(() => {
				dispatch(setRoll({
					...route.params
				}))
			}, 1000);
		}
	}, [isFocused]);

	const save = async () => {

		const mediaSelected = [];

		Object.values(selected).forEach((item) => mediaSelected.push(item));

		console.log(mediaSelected);

		const upload = async () => {
			if (route.params.holderType !== "none") {
				for await (const media of mediaSelected) {

					console.log("payload:", {
						uri: media.image.uri,
						type: media.type,
						holderId: route.params.holderId
					})
					ExpoJobQueue.addJob<UploadItem>("mediaQueueV9", {
						filename: moment().unix() + "_" + v4() + "." + media.image.extension,
						extension: media.image.extension,
						uri: media.image.uri,
						type: media.type,
						holderId: route.params.holderId,
						holderType: route.params.holderType,
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
		{route.params.holderType === "socialProfile" ? <View style={{ flex: 2, justifyContent: 'center', padding: 15, paddingBottom: 0, backgroundColor: "#FFFEFD" }}>
			{route.params.profile.people.length === 1 ? <View style={{
				flexDirection: "row",
				alignItems: "center",
			}}>
				<ProfilePicture width={50} height={50} location={route.params.profile.people[0].profilePictureSource} />
				<View style={{ flex: 1, alignItems: "flex-start", flexDirection: "column", margin: 10 }}>
					<Text style={{
						fontSize: 20,
						marginBottom: 0,
						fontFamily: "Red Hat Display Bold",
					}}>{route.params.profile.people[0].firstName} {route.params.profile.people[0].lastName}</Text>
					<Text style={{
						fontSize: 16,
						marginTop: -5,
						fontFamily: "Red Hat Display Regular",
					}}>{route.params.profile.people[0].username}</Text>
				</View>
			</View> : null}
		</View> : null}

		<View style={{
			backgroundColor: "#FFFEFD",
			flexDirection: "row",
			flex: 2,
			justifyContent: 'space-between',
		}}>
			<View style={{
				justifyContent: "flex-end",
				flexGrow: 1,
				flexDirection: "column",
			}}>
				<Text style={{
					fontSize: 32,
					fontFamily: "Red Hat Display Bold",
					paddingVertical: 5,
					padding: 14,
					paddingBottom: 10,
					textAlign: "left",
					textAlignVertical: "center",
				}}>Recents</Text>
			</View>
			<View style={{
				justifyContent: "center",
			}}>
				<TouchableOpacity>
					<Text style={{
						fontSize: 16,
						fontFamily: "Red Hat Display Semi Bold",
						paddingTop: 20,
						padding: 15,
						color: "#A6A6A6",
						textAlign: "right",
					}}>Clear</Text>
				</TouchableOpacity>
			</View>

		</View>

		<View style={{ flex: 20, alignContent: "center", justifyContent: "center", flexDirection: "row" }}>
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


