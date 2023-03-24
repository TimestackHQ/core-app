import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Image, TouchableOpacity, View, Text, Alert} from "react-native";
import {useEffect, useState} from "react";
import {useNavigation, useRoute} from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import {getTimezone} from "../utils/time";
import Video from "react-native-video";

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
								{moment(res.data.media.timestamp).tz(String(timezone)).format("MMMM D, YYYY")}
							</Text>
							<Text style={{
								fontSize: 10, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment(res.data.media.timestamp).tz(String(timezone)).format("h:mm A")}
							</Text>
						</View>
					) : <View>
						<Text style={{
							fontSize: 15, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
						}}>

						</Text>
					</View>
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
			<TouchableOpacity style={{flex: 1}} onPress={() => navigator.goBack()}>
				<Text>Hey</Text>
			</TouchableOpacity>
			<View style={{flex: 8}}>
				{media?.type === "video" ?
					<Video
						onAudioBecomingNoisy
						poster={media?.thumbnail}
						controls={true}
						source={{uri: media?.storageLocation}}
						style={{flex: 1, height: "100%"}}
						resizeMode="contain"
					/>
					: <Image source={{uri: media?.storageLocation}} style={{height: "90%", width: "100%"}}/>}
			</View>
			<View style={{flex: 1}}></View>
		</View>
	);
}