import {useNavigation, useRoute} from "@react-navigation/native";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback, Alert
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import HTTPClient from "../httpClient";
import FastImage from "react-native-fast-image";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import moment from "moment-timezone";
import DatePicker from "react-native-date-picker";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
// import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "../utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {HeaderButtons} from "react-navigation-header-buttons";
import * as ImagePicker from "react-native-image-picker";
import {getTimezone} from "../utils/time";
import TimestackMedia from "../Components/TimestackMedia";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function EditEvent () {

	const route = useRoute();
	const navigation = useNavigation();
	const scrollRef = React.createRef();

	const [event, setEvent] = useState(null);
	const [name, setName] = React.useState(route.params.eventName);
	const [startDate, setStartDate] = React.useState(new Date())
	const [startDateOpen, setStartDateOpen] = React.useState(false);
	const [endDate, setEndDate] = React.useState(null);
	const [endDateOpen, setEndDateOpen] = React.useState(false);
	const [location, setLocation] = React.useState("");
	const [about, setAbout] = React.useState("");
	const [uploadedCover, setUploadedCover] = React.useState(null);
	const [locationMapsPayload, setLocationMapsPayload] = React.useState(null);


	const [loadingCover, setLoadingCover] = React.useState(false);
	const [cover, setCover] = React.useState(route.params.eventThumbnail);
	const [nextScreen, setNextScreen] = React.useState(false);
	const [keyBoardOpen, setKeyBoardOpen] = React.useState(false);

	const submitButtonRef = useRef();



	function _scrollToInput (reactNode) {
		console.log(scrollRef)
		// Add a 'scroll' ref to your ScrollView
		// scrollRef.current.scrollToFocusedInput(reactNode)
	}

	useEffect(() => {
		HTTPClient("/events/"+route.params?.eventId).then(res => {
			setName(res.data.event.name);
			setEvent(res.data.event);
			setStartDate(new Date(res.data.event.startsAt));
			if(res.data.event?.endsAt) setEndDate(new Date(res.data.event.endsAt));
			if(res.data.event?.location) setLocation(res.data.event.location);
			if(res.data.event?.about) setAbout(res.data.event.about);
		})
			.catch((error) => {
				console.log(error);
			});


		navigation.setOptions({

			headerBackTitle: "Cancel",

			// headerRight: () => (
			//
			// 	<HeaderButtons>
			// 		<TouchableOpacity onPress={updateEvent}>
			// 			<Text style={{
			// 				fontFamily: 'Red Hat Display Semi Bold',
			// 				fontSize: 18,
			// 			}}>
			// 				Save
			// 			</Text>
			// 		</TouchableOpacity>
			//
			// 	</HeaderButtons>
			//
			// ),
		});
	}, []);

	const importCover = async () => {

		setLoadingCover(true);

		ImagePicker.launchImageLibrary({
			mediaType: "photo",
		}).then(async result => {

			if (!result.didCancel) {

				console.log(result)

				const mediaId = uuid.v4();
				const media = result.assets[0];
				console.log(media)
				setCover(media);

				const uri = media?.type === "video"
					? await processVideo(mediaId, media.uri, 15, 25, 600, 10)
					: await processPhoto(mediaId, media.uri, 5, false);
				const thumbnail = media?.type === "video"
					? await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10)
					: await processPhoto(mediaId+".thumbnail", media.uri, 5, true);
				const snapshot = media?.type === "video" ? await generateScreenshot(mediaId+"snapshot", uri, 0.5) : null

				const formData = new FormData();
				formData.append('media', {
					uri: uri,
					name: uri.split("/").pop(),
					type: media.type === "video" ? "video/mp4" : "image/jpeg"
				});
				formData.append('thumbnail', {
					uri: thumbnail,
					name: thumbnail.split("/").pop(),
					type: media.type === "video" ? "video/mp4" : "image/jpeg"
				});
				if(snapshot) formData.append('snapshot', {
					uri: snapshot,
					name: snapshot.split("/").pop(),
					type: "image/jpeg"
				});

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


	useEffect(() => console.log(keyBoardOpen), [keyBoardOpen]);

	const updateEvent = async () => {
		HTTPClient("/events/"+event?._id, "PUT", {
			name: name,
			startsAt: moment(startDate),
			endsAt: endDate ? moment(endDate) : undefined,
			location: location ? location : undefined,
			about: about ? about : undefined,
			invitees: [],
			cover: uploadedCover ? uploadedCover.media.publicId : undefined,
			locationMapsPayload: locationMapsPayload ? locationMapsPayload : undefined
		}).then((res) => {
			const {event} = res.data;

			navigation.navigate("Event", {
				eventId: event._id,
				eventName: event.name,
				eventLocation: event.location,
				updateId: Math.random(),
				refresh: true
			});
		}).catch((err) => {
			Alert.alert("Error", "We couldn't update your event. Please try again.");
			console.log(err.response.data);
		});
	}

	return <KeyboardAwareScrollView innerRef={ref => [scrollRef]} style={{backgroundColor: "white", paddingTop: 20}} behavior="height" enabled>
		<View style={{justifyContent: 'center', alignItems: 'flex-end', padding: 10, paddingTop: 0}}>
			<TouchableOpacity onPress={updateEvent}>
				<Text style={{
					fontSize: 15,
					fontFamily: "Red Hat Display Semi Bold",
				}}>Save</Text>
			</TouchableOpacity>
		</View>
		<View style={{backgroundColor: "white", flexDirection: "column"}}>
				<View style={{flexDirection: "row", flex: 1}}>
					<View style={{flex: 2}}>
						{/* <Text>{JSON.stringify(event)}</Text> */}
						<TouchableOpacity onPress={importCover}>
							{cover ? <FastImage
								source={{
									uri: cover.uri,
								}}
								style={{
									width: "80%",
									height: 220,
									margin: 20,
									marginTop: 0,
									borderRadius: 10,
									borderWidth: event?.buffer ? 0 : 2,
									borderColor: "black"
								}}
							/> : event?.thumbnailUrl ? <TimestackMedia
								source={event?.thumbnailUrl}
								style={{
									width: "80%",
									height: 220,
									margin: 20,
									marginTop: 0,
									borderRadius: 10,
									borderWidth: event?.buffer ? 0 : 2,
									borderColor: "black"
								}}
							/> : null}
						</TouchableOpacity>

					</View>
					<View style={{flex: 2, marginRight: 5}}>
						<Text style={{fontFamily: 'Red Hat Display Semi Bold', marginBottom: -5, size: 10,color: "gray",}}>Title </Text>
						<TextInput
							multiline={true}
							value={name}
							onChangeText={(e) => setName(e)}
							style={{
								fontFamily: 'Red Hat Display Semi Bold',
								fontSize: 20,

							}}
						/>
					</View>
				</View>
				<View style={{marginLeft: 20, flex: 4, height: 300}}>

						{location ? <Text
							multiline={true}

							caretColor={"black"}
							style={{
								fontFamily: "Red Hat Display Semi Bold",
								fontSize: 15,

								position: "absolute",
								top: keyBoardOpen ? -1000 : 0,
								color: "gray",
								width: "90%",
								zIndex: 1001
							}}
						>Location</Text>: null}
						<TextInput
							value={location}
							onChangeText={e => setLocation(e)}
							placeholder={"Location"}
						           style={{
							fontFamily: "Red Hat Display Semi Bold",
							fontSize: location === "" ? 28 : 20,
							width: "90%",
							padding: 0,
				            top: keyBoardOpen ? -1000 : 20,

				           }}/>

						<Text
							multiline={true}

							caretColor={"black"}
							style={{
								fontFamily: "Red Hat Display Semi Bold",
								fontSize: 15,
								color: "gray",
								width: "90%",
								position: "absolute",
								top: keyBoardOpen ? -1000 : 70,

							}}
						>Start date</Text>
						<TouchableOpacity style={{position: "absolute", top: keyBoardOpen ? -1000 : 90, width: "100%"}} onPress={() => setStartDateOpen(true)}>
							<Text
								multiline={true}

								caretColor={"black"}
								style={{
									fontFamily: "Red Hat Display Semi Bold",
									fontSize: 28,
									width: "90%",
									zIndex: 2000,

								}}
							>{moment(startDate).format("dddd, MMM D YYYY")}</Text>
						</TouchableOpacity>
						<DatePicker
							modal
							mode="date"
							open={startDateOpen}
							date={moment(startDate).tz(getTimezone(), true).toDate()}
							onConfirm={async (date) => {
								setStartDate(moment(date).toDate());
								if (endDate < startDate) {
									setEndDate(null)
								}
								setStartDateOpen(false)
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
								position: "absolute",
								fontSize: 15,
								top: keyBoardOpen ? -1000 : 140,
								width: "90%",

							}}
						>End date</Text>: null}
						<TouchableOpacity style={{position: "absolute", top: keyBoardOpen ? -1000 : 160, width: "100%"}} onPress={() => setEndDateOpen(true)}>
							<Text
								multiline={true}

								caretColor={"black"}
								style={{
									fontFamily: "Red Hat Display Semi Bold",
									fontSize:28,

									width: "90%",
									color: endDate ? "black" : '#c8c7cc',

								}}
							>{endDate ? moment(endDate).format("dddd, MMM D YYYY") : "End date"}</Text>
						</TouchableOpacity>
						<DatePicker
							minimumDate={startDate}
							modal
							mode="date"
							open={endDateOpen}
							date={endDate ? moment(endDate).tz(getTimezone(), true).toDate() : moment(startDate).tz(getTimezone(), true).toDate()}
							onConfirm={async (date) => {
								setEndDate(moment(date).toDate());
								setEndDateOpen(false)
							}}
							onCancel={() => {
								setEndDateOpen(false)
							}}
						/>

					{about ? <Text
						multiline={true}

						caretColor={"black"}
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							position: "absolute",
							fontSize: 15,
							top: keyBoardOpen ? 0 : 210,
							color: "gray",
							width: "90%",
						}}
					>About</Text>: null}
					<TextInput
						defaultValue={about}
						onFocus={() => {
							setKeyBoardOpen(true)
						}}
						onBlur={() => {
							setKeyBoardOpen(false)
						}}

						value={about}
						onChangeText={e => setAbout(e)}
						multiline={true}
						caretColor={"black"}
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							position: "absolute",
							fontSize: about ? 18: 28,
							top: keyBoardOpen ? 20 : 230,
							width: "90%",
							zIndex: 1,
							height: 1000
						}}
						placeholder={"About"}
					/>





				</View>


				{/*<Text>{route.params?.eventName}</Text>*/}
			</View>


		</KeyboardAwareScrollView>


}