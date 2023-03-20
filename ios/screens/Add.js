import * as React from "react";
import DatePicker from 'react-native-date-picker';
import {
	Image, Keyboard, KeyboardAvoidingView, Platform,
	SafeAreaView,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import FastImage from "react-native-fast-image";
import * as ImagePicker from "expo-image-picker";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import Video from "react-native-video";
import {generateScreenshot, processPhoto, processVideo} from "../utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import uuid from "react-native-uuid";
import moment from "moment";
import HTTPClient from "../httpClient";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function AddScreen({navigation}) {

	const [name, setName] = React.useState("");
	const [startDate, setStartDate] = React.useState(new Date())
	const [startDateOpen, setStartDateOpen] = React.useState(false);
	const [endDate, setEndDate] = React.useState(null);
	const [endDateOpen, setEndDateOpen] = React.useState(false);
	const [location, setLocation] = React.useState("");
	const [about, setAbout] = React.useState("");
	const [uploadedCover, setUploadedCover] = React.useState(null);


	const [loadingCover, setLoadingCover] = React.useState(false);
	const [cover, setCover] = React.useState(null);
	const [nextScreen, setNextScreen] = React.useState(false);

	const importCover = async () => {

		setLoadingCover(true);

		ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsMultipleSelection: false,
			exif: true,
			quality: 0,
		}).then(async result => {
			if (!result.canceled) {

				console.log(result)

				const mediaId = uuid.v4();
				const media = result.assets[0];
				setCover(media);
				const uri = media?.type === "video"
					? await processVideo(mediaId, media.uri, 15, 25, 600, 10)
					: await processPhoto(mediaId, media.uri, 80);
				const snapshot = media?.type === "video" ? await generateScreenshot(mediaId+"snapshot", uri, 0.5) : null

				console.log(uri)
				const formData = new FormData();
				formData.append('thumbnail', {uri: uri, name: uri.split("/").pop()});
				if(snapshot) formData.append('snapshot', {uri: snapshot, name: snapshot.split("/").pop()});

				axios.post(apiUrl+"/v1/media/cover", formData,{
					headers: {
						authorization: "Bearer " + (await AsyncStorage.getItem("@session")),
						"Content-Type": "multipart/form-data",
					}
				})
					.then((res) => {
						setUploadedCover(res.data);
					})
					.catch((err) => {
						console.log(err.response.data);
					})
					.finally(() => setLoadingCover(false));

			}

		}).catch(err => {
			console.log(err.response);
			setLoadingCover(false);
		})



	}

	const createEvent = async () => {
		HTTPClient("/events", "POST", {
			name: name,
			startsAt: moment(startDate).format("YYYY-MM-DD"),
			endsAt: endDate ? moment(endDate).format("YYYY-MM-DD") : undefined,
			location: location ? location : undefined,
			about: about ? about : undefined,
			invitees: [],
			cover: uploadedCover ? uploadedCover.media.publicId : undefined,
		}).then((res) => {
			const {event} = res.data;
			setName("");
			setStartDate(new Date());
			setEndDate(null);
			setLocation("");
			setAbout("");
			setUploadedCover(null);
			setCover(null);
			setNextScreen(false);
			navigation.navigate("Event", {
				eventId: event._id,
				eventName: event.name,
				eventLocation: event.location
			});
		}).catch((err) => {
			console.log(err.response.data);
		});
	}

	return nextScreen ?
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1, backgroundColor: "white" }}
		>
			<SafeAreaView
				style={{
					flex: 1,
					justifyContent: "center",
					marginLeft: 20,
					height: "100%",
				}}
			>
			{/*<TouchableOpacity style={{*/}
			{/*	width: 60,*/}
			{/*	height: 50,*/}
			{/*	position: "absolute",*/}
			{/*	top: 60,*/}
			{/*	left: -10,*/}
			{/*}} onPress={() => setNextScreen(false)}>*/}
			{/*	<FastImage source={require("../assets/icons/collection/left-arrow.png")} style={{*/}

			{/*		width: 25,*/}
			{/*		height: 25,*/}
			{/*	}}/>*/}
			{/*</TouchableOpacity>*/}

			<Text
				multiline={true}

				caretColor={"black"}
				style={{
					position: "absolute",
					top:0,
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 15,
					color: "gray",
					width: "90%",
					// paddingBottom: 325,
				}}
			>{startDate && endDate ? "From" : "Start date"}</Text>
			<TouchableOpacity style={{position: "absolute", bottom: 510, width: "100%"}} onPress={() => setStartDateOpen(true)}>
				<Text
					multiline={true}

					caretColor={"black"}
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						fontSize: 28,

						// paddingBottom: 0,

						width: "90%",

					}}
				>{moment(startDate).format("dddd, MMM D YYYY")}</Text>
			</TouchableOpacity>
			<DatePicker
				modal
				mode="date"
				open={startDateOpen}
				date={startDate}
				onConfirm={(date) => {
					setStartDateOpen(false)
					setStartDate(date)
				}}
				onCancel={() => {
					setStartDateOpen(false)
				}}
			/>
			{endDate ? <Text
				multiline={true}

				caretColor={"black"}
				style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 15,

					// paddingBottom:0,
					color: "gray",
					width: "90%",
					
				}}
			>{startDate && endDate ? "To" : "End date"}</Text>: null}
			<TouchableOpacity style={{position: "absolute", bottom: 440, width: "100%"}} onPress={() => setEndDateOpen(true)}>
				<Text
					multiline={true}

					caretColor={"black"}
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						fontSize:28,

						width: "90%",
						color: endDate ? "black" : "gray",
						
					}}
				>{endDate ? moment(endDate).format("dddd, MMM D YYYY") : "End date"}</Text>
			</TouchableOpacity>
			<DatePicker
				minimumDate={startDate}
				modal
				mode="date"
				open={endDateOpen}
				date={endDate ? endDate : startDate}
				onConfirm={(date) => {
					setEndDateOpen(false)
					setEndDate(date)
				}}
				onCancel={() => {
					setEndDateOpen(false)
				}}
			/>
			{location ? <Text
				multiline={true}

				caretColor={"black"}
				style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 15,
					
					color: "gray",
					width: "90%",
				}}
			>Location</Text>: null}
			<TextInput
				defaultValue={location}
				value={location}
				onChangeText={e => setLocation(e)}
				multiline={true}
				caretColor={"black"}
				style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 28,
					width: "90%",
				}}
				placeholder={"Location"}
			/>
			{about ? <Text
				multiline={true}

				caretColor={"black"}
				style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 15,
					
					color: "gray",
					width: "90%",
				}}
			>About</Text>: null}
			<TextInput
				defaultValue={about}
				value={about}
				onChangeText={e => setAbout(e)}
				multiline={true}
				caretColor={"black"}
				style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: about ? 18: 28,
					
					width: "90%",
				}}
				placeholder={"About"}
			/>
			<TouchableOpacity style={{
				textAlign: "center",
				color: "grey",
				position: "absolute",
				bottom: 0,
				marginTop: 10,
				
				width: "90%",
				height: 50,
				backgroundColor: "black",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 35,
				marginBottom: 20,
				paddingRight: 0,
			}}
              disabled={name === ""}
              onPress={createEvent}

			>
				<Text style={{
					fontFamily: "Red Hat Display Semi Bold",
					color: "white",
					fontSize: 20,
					textShadowColor: '#FFF',
					textShadowOffset: { width: 0, height: 0 },
					textShadowRadius: 10,
				}}>CREATE</Text>
			</TouchableOpacity>

			</SafeAreaView>
	</KeyboardAvoidingView> : <View onTouchStart={Keyboard.dismiss} style={{flex: 1, backgroundColor: "white"}}>
		<ScrollView style={{flex: 1, height: "100%",
			
			Content: "center",
		}}>
			<View style={{
				alignItems: "center",
				justify: "center",
				height: "100%",
				justifyContent: 'flex-end',
				transform: [{ scaleY: -1 }],
			}}>
					<TextInput
						defaultValue={name}
						value={name}
						onChangeText={e => setName(e)}
						multiline={true}
						caretColor={"black"}
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							position: "absolute",
							textAlign: "center",
							fontSize: 30,
							bottom: 120,
							width: "90%",
							
							transform: [{ scaleY: -1 }],
						}}
						placeholder={"Event name"}
					/>
			</View>

		</ScrollView>
		<View style={{
			flex: 2,
			height: "100%",
			
			alignItems: "center",
		}}>
			<TouchableWithoutFeedback onPress={importCover}>
				{cover?.type === "video" ?
					<Video
						source={{uri: cover.uri}}
						muted={true}
						resizeMode="cover"
						style={{
							borderRadius: 35, width: 220, height:280
						}}
					/>
					:<FastImage
						alt={"Cassis 2022"}
						style={{borderRadius: 35, width: 220, height:280}}
						source={cover?.uri ? {uri: cover.uri} : require("../assets/add-media.png")}
					/>
				}
			</TouchableWithoutFeedback>
			<Text style={{
				fontFamily: "Red Hat Display Semi Bold",
				textAlign: "center",
				color: "grey",
				fontSize: 13,
				marginTop: 10,
				
				width: "90%",
				
			}}>
				{loadingCover ? "loading..." : (cover?.uri ? "" : "You can add a cover later")}
			</Text>
			<TouchableOpacity style={{
				textAlign: "center",
				color: "grey",
				position: "absolute",
				bottom: 0,
				marginTop: 10,

				width: "90%",
				height: 50,
				backgroundColor: "black",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 35,
				marginBottom: 20
			}}
            disabled={name === ""}
            onPress={() => setNextScreen(true)}

			>
				<Text style={{
					fontFamily: "Red Hat Display Semi Bold",
					color: "white",
					fontSize: 20,
					textShadowColor: '#FFF',
					textShadowOffset: { width: 0, height: 0 },
					textShadowRadius: 10,
				}}>OKAY</Text>
			</TouchableOpacity>
		</View>
	</View>
}