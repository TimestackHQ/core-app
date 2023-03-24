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
import moment from "moment/moment";
import DatePicker from "react-native-date-picker";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import {generateScreenshot, processPhoto, processVideo} from "../utils/compression";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {HeaderButtons} from "react-navigation-header-buttons";

const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function EditEvent () {

	const route = useRoute();
	const navigation = useNavigation();
	const scrollRef = React.createRef();

	const [event, setEvent] = useState(null);
	const [name, setName] = React.useState("");
	const [startDate, setStartDate] = React.useState(new Date())
	const [startDateOpen, setStartDateOpen] = React.useState(false);
	const [endDate, setEndDate] = React.useState(null);
	const [endDateOpen, setEndDateOpen] = React.useState(false);
	const [location, setLocation] = React.useState("");
	const [about, setAbout] = React.useState("");
	const [uploadedCover, setUploadedCover] = React.useState(null);
	const [locationMapsPayload, setLocationMapsPayload] = React.useState(null);


	const [loadingCover, setLoadingCover] = React.useState(false);
	const [cover, setCover] = React.useState(null);
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
				console.log(media)
				setCover(media);
				const uri = await processPhoto(mediaId, media.uri, 80);
				// const snapshot = media?.type === "video" ? await generateScreenshot(mediaId+"snapshot", uri, 0.5) : null

				console.log(uri)
				const formData = new FormData();
				formData.append('thumbnail', {uri: uri, name: uri.split("/").pop()});
				// if(snapshot) formData.append('snapshot', {uri: snapshot, name: snapshot.split("/").pop()});

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
			startsAt: moment(startDate).format("YYYY-MM-DD"),
			endsAt: endDate ? moment(endDate).format("YYYY-MM-DD") : undefined,
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
				updateId: Math.random()
			});
		}).catch((err) => {
			Alert.alert("Error", "We couldn't update your event. Please try again.");
			console.log(err.response.data);
		});
	}

	return <KeyboardAwareScrollView innerRef={ref => [scrollRef]} style={{backgroundColor: "white", paddingTop: 20}} behavior="height" enabled>
			<View style={{backgroundColor: "white", flexDirection: "column"}}>
				<View style={{flexDirection: "row", flex: 1}}>
					<View style={{flex: 2}}>
						<TouchableWithoutFeedback onPress={importCover}>
							<FastImage
								source={{
									uri: cover ? cover.uri : "data:image/jpeg;base64,"+event?.buffer,
								}}
								style={{
									width: "80%",
									height: 220,
									margin: 20,
									marginTop: 0,
									borderRadius: 10,
									borderWidth: event?.buffer ? 0 : 2,
									borderStyle: "solid",
									borderColor: "black"
								}}
							/>
						</TouchableWithoutFeedback>

					</View>
					<View style={{flex: 2, marginRight: 5}}>
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
						<GooglePlacesAutocomplete
							textInputProps={{
								onChangeText: (e) => {
									// get all text and set it to location state
									setLocation(e)
								},
								value: location,
							}}
							// currentLocation={true}

							styles={{
								container: {
									fontFamily: "Red Hat Display Semi Bold",
									position: "absolute",
									margin: 0,
									padding: 0,
									backgroundColor: "white",
									top: keyBoardOpen ? -1000 : 20,
									width: "90%",
									zIndex: 1000,
								},
								textInputContainer: {
									backgroundColor: "transparent",
									margin: 0,
									padding: 0,
								},
								textInput: {
									fontFamily: "Red Hat Display Semi Bold",
									fontSize: location === "" ? 28 : 20,
									width: "90%",
									margin: -10,
									padding: 0,
								},
								row: {
									fontFamily: "Red Hat Display Semi Bold",
									backgroundColor: "white",
									margin: 0,
									marginTop: 10,
									marginBottom: -10,
									padding: 0,
									zIndex: 1000,
								},
								separator: {
									height: 0.5,
									margin: 0,
									padding: 0,
									backgroundColor: '#c8c7cc',
								},
								description: {
									fontFamily: "Red Hat Display Semi Bold",
									backgroundColor: "white",
									zIndex: 1000,
								}

							}}

							placeholder='Location'
							onPress={(data, details = null) => {
								// 'details' is provided when fetchDetails = true
								console.log(data);
								console.log(details);
								setLocation(data.structured_formatting.main_text);
								setLocationMapsPayload(details)
							}}

							query={{
								key: 'AIzaSyCyFybVOEKwDbbyCRaOs64OMpVMwmYXA0s',
								language: 'en',
							}}
						/>

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
						>{startDate && endDate ? "From" : "Start date"}</Text>
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
								position: "absolute",
								fontSize: 15,
								top: keyBoardOpen ? -1000 : 140,
								color: "gray",
								width: "90%",

							}}
						>{startDate && endDate ? "To" : "End date"}</Text>: null}
						<TouchableOpacity style={{position: "absolute", top: keyBoardOpen ? -1000 : 160, width: "100%"}} onPress={() => setEndDateOpen(true)}>
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
		<TouchableOpacity ref={ref => submitButtonRef.current = ref} style={{
			textAlign: "center",
			color: "grey",
			position: "absolute",
			bottom: -200,
			marginTop: 10,
			marginLeft: 20,
			width: "90%",
			height: 50,
			backgroundColor: "black",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 35,
			marginBottom: 20
		}}
		                  onPress={updateEvent}

		>
			<Text style={{
				fontFamily: "Red Hat Display Semi Bold",
				color: "white",
				fontSize: 20,
				textShadowColor: '#FFF',
				textShadowOffset: { width: 0, height: 0 },
				textShadowRadius: 10,
			}}>SAVE</Text>
		</TouchableOpacity>

		</KeyboardAwareScrollView>


}