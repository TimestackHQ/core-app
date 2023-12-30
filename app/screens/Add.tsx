import * as React from "react";
import DatePicker from 'react-native-date-picker';
import {
	ActivityIndicator,
	Alert,
	Keyboard, KeyboardAvoidingView, Platform,
	SafeAreaView,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	Switch
} from "react-native";
import KeyboardListener from 'react-native-keyboard-listener';
import FastImage from "react-native-fast-image";
import * as ImagePicker from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import moment from "moment-timezone";
import HTTPClient from "../httpClient";
import { useEffect } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { getTimezone } from "../utils/time";
import * as TimestackCoreModule from "../modules/timestack-core";


const apiUrl = Constants.expoConfig.extra.apiUrl;

export default function AddScreen({ navigation }) {

	const [name, setName] = React.useState("");
	const [startDate, setStartDate] = React.useState(new Date())
	const [startDateOpen, setStartDateOpen] = React.useState(false);
	const [endDate, setEndDate] = React.useState(null);
	const [endDateOpen, setEndDateOpen] = React.useState(false);
	const [location, setLocation] = React.useState("");
	const [about, setAbout] = React.useState("");
	const [locationMapsPayload, setLocationMapsPayload] = React.useState(null);
	const [isEnabled, setIsEnabled] = React.useState(true);



	const [loadingCover, setLoadingCover] = React.useState(false);
	const [cover, setCover] = React.useState<{
		localUri: string,
		mediaId: string}>(null)

	const [nextScreen, setNextScreen] = React.useState(false);
	const [keyBoardOpen, setKeyBoardOpen] = React.useState(false);

	const importCover = async () => {

		setLoadingCover(true);

		ImagePicker.launchImageLibrary({
			mediaType: "photo",
		}).then(async result => {
			console.log(result)

			if (!result.didCancel) {

				console.log(result)

				const media = result.assets[0];

				const upload = await TimestackCoreModule.uploadFile(
					{
						mediaFile: media.uri,
						mediaThumbnail: media.uri,
					},
					`${apiUrl}/v1/media`,
					"POST",
					{
						Authorization: `Bearer ${await AsyncStorage.getItem('@session')}`,
					},
					{
						holderId: "none",
						holderType: "cover",
						mediaQuality: "high",
						mediaFormat: media.type === "video" ? "mp4" : "jpeg",
					}
				);

				const responseBody = JSON.parse(upload.body);

				console.log("cover media id", responseBody.media._id);

				setCover({
					localUri: media.uri,
					mediaId: responseBody.media._id
				});

			}

		}).catch(err => {
			console.log(err.response);
			setLoadingCover(false);
		})

			.finally(() => setLoadingCover(false));



	}

	const clear = () => {
		setName("");
		setStartDate(new Date());
		setEndDate(null);
		setLocation("");
		setAbout("");
		setCover(null);
		setNextScreen(false)
	}

	useEffect(() => console.log(keyBoardOpen), [keyBoardOpen]);
	const createEvent = async () => {
		HTTPClient("/events", "POST", {
			name: name,
			startsAt: moment(startDate),
			endsAt: endDate ? moment(endDate) : undefined,
			location: location ? location : undefined,
			about: about ? about : undefined,
			invitees: [],
			cover: cover ? cover.mediaId : undefined,
			locationMapsPayload: locationMapsPayload ? locationMapsPayload : undefined,
			defaultPermission: isEnabled ? "editor" : "viewer"
		}).then((res) => {
			const { event } = res.data;

			navigation.navigate("Event", {
				eventId: event._id,
				eventName: event.name,
				eventLocation: event.location,
				openUpload: true
			});
			setTimeout(clear, 1000);
		}).catch((err) => {
			Alert.alert("Error", "We couldn't create your event. Please try again.");
			console.log(err.response.data);
		});
	}

	return nextScreen ? <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: "white", margin: 0 }}>
			<SafeAreaView style={{
				flex: 1,
				marginLeft: 20,
				marginRight: -20,
				position: "relative",
				top: 0,
				zIndex: 100,
			}}>
				<KeyboardListener
					onWillShow={() => { setKeyBoardOpen(true); }}
					onWillHide={() => { setKeyBoardOpen(false); }}
				/>
				<TouchableOpacity style={{
					width: 60,
					height: 50,
					position: "absolute",
					top: 60,
					left: -10,
				}} onPress={() => {
					setKeyBoardOpen(false);
					setNextScreen(false)
				}}>
					<FastImage source={require("../assets/icons/collection/left-arrow.png")} style={{

						width: 25,
						height: 25,
					}} />

				</TouchableOpacity>
				<Text style={{
					fontFamily: "Red Hat Display Semi Bold",
					fontSize: 15,
					color: "gray",
					width: "90%",
					position: "absolute",
					top: keyBoardOpen ? -1000 : 95,
				}}>{isEnabled ? "Anyone that joins will be an editor by default." : "Anyone that joins will be a viewer by default."}</Text>
				<Switch
					style={{
						position: "absolute",
						top: keyBoardOpen ? -1000 : 120,
					}}
					trackColor={{ true: 'black', false: "white" }}
					thumbColor={isEnabled ? '#f4f3f4' : 'black'}
					onValueChange={() => setIsEnabled(previousState => !previousState)}
					value={isEnabled}

				/>
				<Text
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						fontSize: 15,
						color: "gray",
						width: "90%",
						position: "absolute",
						top: keyBoardOpen ? -1000 : 170,

					}}
				>{startDate && endDate ? "From" : "Start date*"}</Text>
				<TouchableOpacity style={{ position: "absolute", top: keyBoardOpen ? -1000 : 190, width: "100%" }} onPress={() => setStartDateOpen(true)}>
					<Text
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							fontSize: 28,
							width: "90%",

						}}
					>{moment(startDate).format("dddd, MMM D YYYY")}</Text>
				</TouchableOpacity>
				<DatePicker
					modal
					mode="date"
					open={startDateOpen}
					date={startDate}
					confirmText={"Confirm"}
					cancelText={"❌"}
					theme={"dark"}
					onConfirm={async (date) => {
						setStartDate(moment(date).tz(getTimezone(), true).toDate());
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
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						position: "absolute",
						fontSize: 15,
						top: keyBoardOpen ? -1000 : 240,
						color: "gray",
						width: "90%",

					}}
				>{startDate && endDate ? "To" : "End date"}</Text> : null}
				<TouchableOpacity style={{ position: "absolute", top: keyBoardOpen ? -1000 : 260, width: "100%", zIndex: -3000 }} onPress={() => {
					setEndDateOpen(true)
				}}>
					<Text
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							fontSize: 28,

							width: "90%",
							color: endDate ? "black" : "#C5C5C7",

						}}
					>{endDate ? moment(endDate).format("dddd, MMM D YYYY") : "End date"}</Text>
				</TouchableOpacity>
				<DatePicker
					minimumDate={startDate}
					modal
					mode="date"
					open={endDateOpen}
					date={endDate ? endDate : startDate}
					confirmText={"Confirm"}
					cancelText={"❌"}
					theme={"dark"}
					onConfirm={async (date) => {
						setEndDate(moment(date).tz(getTimezone(), true).toDate());
						setEndDateOpen(false)
					}}
					onCancel={() => {
						setEndDateOpen(false)
					}}
				/>
				{location ? <Text
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						fontSize: 15,

						position: "absolute",
						top: keyBoardOpen ? 120 : 310,
						color: "gray",
						width: "90%",
						zIndex: 1001
					}}
				>Location</Text> : null}
				<GooglePlacesAutocomplete
					textInputProps={{
						onChangeText: (e) => {
							// get all text and set it to location state
							setLocation(e)
						}
						// value: location,
					}}
					// currentLocation={true}

					styles={{
						container: {
							fontFamily: "Red Hat Display Semi Bold",
							position: "absolute",
							margin: 0,
							padding: 0,
							backgroundColor: "white",
							top: keyBoardOpen ? 140 : 324,
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

				{about ? <Text
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						position: "absolute",
						fontSize: 15,
						top: keyBoardOpen ? 180 : 360,
						color: "gray",
						width: "90%",
					}}
				>About</Text> : null}
				<TextInput
					defaultValue={about}
					value={about}
					onChangeText={e => setAbout(e)}
					multiline={true}
					style={{
						fontFamily: "Red Hat Display Semi Bold",
						position: "absolute",
						fontSize: about ? 18 : 28,
						top: keyBoardOpen ? 200 : 370,
						width: "90%",
						zIndex: 1
					}}
					placeholder={"About"}
				/>
				<TouchableOpacity style={{
					position: "absolute",
					bottom: 0,
					marginTop: 10,

					marginRight: 0,
					width: "90%",
					height: 50,
					backgroundColor: "black",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: 35,
					marginBottom: 20,
					paddingRight: 0,
					zIndex: 1020
				}}
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
		</KeyboardAvoidingView>
	</TouchableWithoutFeedback> : <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1, backgroundColor: "white" }}>
		<SafeAreaView style={{ flex: 1 }}>
			<View style={{
				flex: 1, height: "100%"
			}}>
				{name || cover ? <TouchableOpacity onPress={clear} style={{
					position: "absolute",
					top: 20,
					right: 30,
					zIndex: 1000
				}}>
					<Text>
						Clear
					</Text>
				</TouchableOpacity> : null}
				<View style={{
					alignItems: "center",
					height: "100%",
					justifyContent: 'flex-end',
					transform: [{ scaleY: -1 }],
				}}>

					<TextInput
						defaultValue={name}
						value={name}
						onChangeText={e => setName(e)}
						multiline={true}
						scrollEnabled={false}
						style={{
							fontFamily: "Red Hat Display Semi Bold",
							position: "absolute",
							textAlign: "center",
							fontSize: 30,
							bottom: 70,
							width: "90%",

							transform: [{ scaleY: -1 }],
						}}
						placeholder={"Event name"}
					/>
				</View>

			</View>
			<View style={{
				flex: 2,
				height: "100%",

				alignItems: "center",
			}}>
				<TouchableWithoutFeedback onPress={importCover}>
					<FastImage
						style={{ borderRadius: 35, width: 220, height: 280 }}
						source={cover?.localUri ? { uri: cover.localUri } : require("../assets/add-media.png")}
					/>
				</TouchableWithoutFeedback>
				{loadingCover ? <ActivityIndicator color={"black"} style={{ marginTop: 10 }} /> : <Text style={{
					fontFamily: "Red Hat Display Semi Bold",
					textAlign: "center",
					color: "grey",
					fontSize: 13,
					marginTop: 10,

					width: "90%",

				}}>
					{cover?.localUri ? "" : "You can add a cover later"}
				</Text>}
				<TouchableOpacity style={{
					position: "absolute",
					bottom: 0,
					marginTop: 10,

					width: "90%",
					height: 50,
					backgroundColor: name === "" ? "#9a9a9a" : "black",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: 35,
					marginBottom: 20
				}}
					onPress={() => {
						if (name === "") {
							Alert.alert("Event name", "Please enter a name for your event", [
								{
									text: "OK",
								}
							])
						}
						else setNextScreen(true)
					}}

				>
					<Text style={{
						fontFamily: "Red Hat Display Semi Bold",
						color: "white",
						fontSize: 20,
						textShadowColor: name === "" ? "transparent" : '#FFF',
						textShadowOffset: { width: 0, height: 0 },
						textShadowRadius: 10,
					}}>OKAY</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	</TouchableWithoutFeedback>
}