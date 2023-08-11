import {
	Image,
	TouchableWithoutFeedback,
	View,
	Platform,
	Alert, PermissionsAndroid,
	Dimensions
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState, Component, } from "react";
import { CameraRoll, PhotoIdentifier } from "@react-native-camera-roll/camera-roll";
import FastImage from "react-native-fast-image";
import * as React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as _ from "lodash";

import moment from "moment";
import { v4 } from "uuid";
import * as Network from "expo-network";
import { NetworkStateType } from "expo-network";
import { UploadItem } from "../types/global";

const width = Dimensions.get("window").width;

const PickerCell = ({ index, item, onMediaPicked }: { index: number, item: PhotoIdentifier, onMediaPicked: any }) => {

	const [picked, setPicked] = useState(false);

	return <View style={{ flexDirection: "column", margin: 0.5, marginLeft: index % 4 === 0 ? 0 : 0.5, marginRight: index % 4 === 3 ? 0 : 0.5 }}>
		<TouchableWithoutFeedback onPress={() => {

			setPicked(!picked);

			onMediaPicked({
				reactEvent: {
					itemDetails: {
						image: {
							extension: item.node.image.extension,
							uri: item.node.image.uri,
							playableDuration: item.node.image.playableDuration,
							filesize: item.node.image.fileSize,
						},
						type: item.node.type.includes("video") ? "video" : "image",
						timestamp: item.node.timestamp
					},
				}
			})
		}}>
			<View style={{ flex: 0 }}>
				{picked ? <View style={{ zIndex: 2 }}>
					<Image fadeDuration={0} source={require("../assets/icons/collection/check-filled.png")} style={{ opacity: 1, position: 'absolute', width: 15, height: 15, top: width / 5, right: 5 }} />
				</View> : null}
				<FastImage
					style={{ width: width / 4, height: width / 4, opacity: picked ? 0.5 : 1, }}
					source={{ uri: item.node.image.uri }}
				/>
			</View>

		</TouchableWithoutFeedback>

	</View>
}

export default function AndroidRoll({ onMediaPicked }) {

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

		if (Number(Platform.Version) >= 33) {
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
		}
		await checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
	}

	useEffect(() => {
		hasAndroidPermission();

		(async () => {
			const images = await CameraRoll.getPhotos({
				first: 200,
				assetType: 'All',
			});
			setMedia(images.edges);
			setCursor(images.page_info.end_cursor);
		})();

	}, []);

	return <View style={{ flex: 1 }}>

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
			estimatedItemSize={width / 3}
			numColumns={4}
			renderItem={({ item, index }) => <PickerCell index={index} item={item} onMediaPicked={onMediaPicked} />}
			keyExtractor={(_item, index) => index.toString()}
			onEndReachedThreshold={3}
		/>

	</View>
}

function formatDuration(durationInSeconds) {
	if (!durationInSeconds) return "";
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
