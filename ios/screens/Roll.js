import {
	FlatList,
	Image,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Text,
	Platform,
	Linking,
	Alert
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


export default function Roll () {

	const navigator = useNavigation();
	const route = useRoute()

	const [media, setMedia] = useState([]);
	const [cursor, setCursor] = useState(undefined);
	const [selected, setSelected] = useState([]);

	const getMedia = async () => {
		const newMedia = await CameraRoll.getPhotos({
			first: 100,
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

		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV20");
		// await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV200");
		//
		// await ExpoJobQueue.removeWorker("mediaQueueV20");
		// await uploadWorker();

		console.log(mediaSelected)
		for await (const media of mediaSelected) {

			//
			console.log("payload:",{
				uri: media.image.uri,
				type: media.type,
				eventId: route.params.eventId
			})
			ExpoJobQueue.addJob("mediaQueueV20", {
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

	useEffect(() => {
		getMedia().then((err) => {
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
				renderItem={({item}) => <View style={{flex: 5, width: "33%", height: 120, margin: 1, backgroundColor: "black"}}
				>
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
			/>
		</View>
	</View>
}