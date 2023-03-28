import * as FileSystem from "expo-file-system";
import ImageZoom from 'react-native-image-pan-zoom';
import {Image, TouchableOpacity, View, Text, Alert, ActivityIndicator, Dimensions} from "react-native";
import {useEffect, useState} from "react";
import Share from "react-native-share";
import {useNavigation, useRoute} from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import {getTimezone} from "../utils/time";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import ProfilePicture from "../Components/ProfilePicture";
import * as MediaLibrary from "expo-media-library";
import {HeaderButtons} from "react-navigation-header-buttons";
import * as React from "react";

function Headers ({media}) {

	const [sharing, setSharing] = useState(false);
	return <HeaderButtons>
		<View>
			<ActivityIndicator color={"#4fc711"} animating={sharing} style={{marginTop: 5}} />
		</View>
		<TouchableOpacity onPress={async () => {
			setSharing(true);
			try {

				await FileSystem.downloadAsync(media?.storageLocation, FileSystem.documentDirectory + media?.fileName);
				setSharing(false);
				await Share.open({
					url: FileSystem.documentDirectory + media?.fileName,
				});
				return;
			} catch(e) {
				console.log(e)
				// if(e !== "[Error: User did not share]") Alert.alert("Error", "Unable to share media");
			}
			setSharing(false);
		}}>

			<Image source={require("../assets/icons/collection/share.png")} style={{width: 30, height: 30}} />
		</TouchableOpacity>
	</HeaderButtons>
}

export default function MediaView() {
	const navigator = useNavigation();
	const route = useRoute();

	const imageUrl = "https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=2726&h=2047&dpr=1"
	const [media, setMedia] = useState(null);

	const [downloading, setDownloading] = useState(false);
	const [sharing, setSharing] = useState(false);

	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const ratio = width && height ? width / height : 1;

	useEffect(() => {

		console.log("MediaView: ", route.params);



		HTTPClient(`/media/view/${route.params?.mediaId}/${route.params?.eventId}`, "GET")
			.then(async res => {
				const timezone = getTimezone();

				setMedia(res.data.media);
				Image.getSize(res.data.media.storageLocation, (width, height) => {
					setWidth(width);
					setHeight(height);
				});

				navigator.setOptions({
					headerBackTitle: "Back",
					headerBackButtonVisible: true,
					headerShown: true,
					headerTitle: () => res.data.media?.timestamp ? (
						<View>
							<Text style={{
								fontSize: 15, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("MMMM D, YYYY")}
							</Text>
							<Text style={{
								fontSize: 10, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("h:mm A")}
							</Text>
						</View>
					) : <View>
						<Text style={{
							fontSize: 15, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
						}}>
						</Text>
					</View>,

					headerRight: () => <Headers media={res.data.media}/>

				});
			})
			.catch(err => {
				console.log(err);
				Alert.alert("Error", "Unable to load media", [
					{
						text: "OK",
						onPress: () => {
							navigator.goBack();
						}
					}
				])
			});


	}, []);

	return (
		<View style={{backgroundColor: "white", flex: 1, flexDirection: "column"}}>
			<View style={{flex: 9}}>
				{media?.type === "video" ?
					<Video
						onAudioBecomingNoisy
						poster={media?.snapshot}
						controls={true}
						source={{uri: media?.storageLocation}}
						style={{flex: 1, height: "100%"}}
						posterResizeMode={"cover"}
						resizeMode="cover"
					/> :
					// : <ReactNativeZoomableView
					// 	maxZoom={1.5}
					// 	minZoom={0.5}
					// 	zoomStep={0.5}
					// 	initialZoom={1}
					// 	contentHeight={height}
					// 	contentWidth={width}
					// 	bindToBorders={false}
					// 	// onZoomAfter={this.logOutZoomState}
					// 	style={{
					// 		// backgroundColor: 'red',
					// 	}}
					// >
					// 	<Image
					// 		source={{uri: media?.storageLocation}}
					// 		style={{
					// 			flex: 1,
					// 			width: Number(ratio > 1 ? 400 * ratio : 400),
					// 			height: Number(ratio < 1 ? 800 : 800 / ratio),
					// 		}}
					// 	/>
					// </ReactNativeZoomableView>
					// :<ImageZoom
					// 	centerOn={{x: 0, y: -30, scale: 1, duration: 100}}
					// 	cropWidth={Dimensions.get('window').width}
			        //     cropHeight={Dimensions.get('window').height}
			        //     imageWidth={"100%"}
			        //     imageHeight={500}
					// 	panToMove={true}
					// >
					//
					// </ImageZoom>
					// // : <Image
					// // 	source={{uri: media?.storageLocation}}
					// // 	style={{
					// // 		flex: 1, maxHeight: "100%"
					// // 	}}
					// // />
					<Image style={{
						flex: 1,
						width: Number(ratio > 1 ? 400 * ratio : 400),
						height: Number(ratio < 1 ? 800 / ratio : 800),
					}}
					       source={{uri: media?.storageLocation}}/>
				}
			</View>
			<View style={{flex: 1, padding: 10, alignContent: "center", flexDirection: "row", backgroundColor: "white"}}>
				<View>
					<ProfilePicture location={media?.user?.profilePictureSource} width={35} height={35}/>
				</View>
				<View style={{flexDirection: "row", justifyContent: "space-between"}}>
					<View style={{flexDirection: "column", justifyContent: "center"}}>
						<Text style={{fontFamily: "Red Hat Display Semi Bold", fontSize: 17, marginBottom: 40, marginLeft: 10}}>
							{media?.user?.firstName} {media?.user?.lastName}
						</Text>

					</View>
				</View>
				<ActivityIndicator animating={downloading} style={{position: 'absolute', right: 40, marginTop: 5}} color={"#4fc711"} />
				<TouchableOpacity onPress={async () => {
					setDownloading(true);
					try {
						const location = await FileSystem.downloadAsync(media?.storageLocation, FileSystem.documentDirectory + media?.fileName);
						await MediaLibrary.saveToLibraryAsync(FileSystem.documentDirectory + media?.fileName)
						alert("Saved");
					} catch (err) {
						alert("Failed to save");
					}
					setDownloading(false)
				}
				} disabled={downloading} style={{position: 'absolute', right: 10, marginTop: 15, marginRight: 5}} >
					<FastImage
						source={require("../assets/icons/download.png")}
						style={{width: 20, height: 20, marginLeft: 10}}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}