import {GestureHandlerRootView} from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import {Image, TouchableOpacity, View, Text, Alert} from "react-native";
import {useEffect, useState} from "react";
import Share from "react-native-share";
import {useNavigation, useRoute} from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import {getTimezone} from "../utils/time";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import ProfilePicture from "../Components/ProfilePicture";
import * as MediaLibrary from "expo-media-library";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import * as React from "react";
import uuid from "react-native-uuid";
import {v4} from "uuid";

export default function MediaView() {
	const navigator = useNavigation();
	const route = useRoute();

	const imageUrl = "https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=2726&h=2047&dpr=1"
	const [media, setMedia] = useState(null);

	useEffect(() => {

		console.log("MediaView: ", route.params);



		HTTPClient(`/media/view/${route.params?.mediaId}/${route.params?.eventId}`, "GET")
			.then(async res => {
				const timezone = getTimezone();

				setMedia(res.data.media);
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

					headerRight: () => (

						<HeaderButtons>
							<TouchableOpacity onPress={async () => {
								await FileSystem.downloadAsync(res.data.media?.storageLocation, FileSystem.documentDirectory + res.data.media?.fileName);
								await Share.open({
									title: "Timestack",
									message: "Timestack " + res.data.media?.type === "video" ? "video" : "photo",
									url: FileSystem.documentDirectory + res.data.media?.fileName,
								});
							}}>

								<Image source={require("../assets/icons/collection/share.png")} style={{width: 30, height: 30}} />
							</TouchableOpacity>
						</HeaderButtons>
					)

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
					/>
					: <Image
						source={{uri: media?.storageLocation}}
						style={{
							flex: 1, maxHeight: "100%"
						}}
					/>
				}
			</View>
			<View style={{flex: 1, margin: 10, alignContent: "center", flexDirection: "row"}}>
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
				<TouchableOpacity onPress={async () => {
					try {
						const location = await FileSystem.downloadAsync(media?.storageLocation, FileSystem.documentDirectory + media?.fileName);
						await MediaLibrary.saveToLibraryAsync(FileSystem.documentDirectory + media?.fileName)
						Alert.alert("Success", "Saved to your device.");
					} catch (err) {
						alert("Failed to save");
					}
				}
				} style={{position: 'absolute', right: 10, marginTop: 5}} >
					<FastImage
						source={require("../assets/icons/download.png")}
						style={{width: 20, height: 20, marginLeft: 10}}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}