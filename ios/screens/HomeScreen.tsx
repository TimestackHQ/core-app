import {
	Image,
	RefreshControl,
	SafeAreaView,
	Text,
	View,
	StyleSheet,
	FlatList,
	TouchableWithoutFeedback, TextInput,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding from "../Components/Onboarding";
import HTTPClient from "../httpClient";
import FastImage from "react-native-fast-image";
import { dateFormatter } from "../utils/time";
import ProfilePicture from "../Components/ProfilePicture";
import TimestackMedia from "../Components/TimestackMedia";

export default function HomeScreen({ navigation, route }) {


	const [firstLoad, setFirstLoad] = React.useState(true);
	const [refreshing, setRefreshing] = React.useState(true);
	const [id, setId] = React.useState("null");
	const isFocused = navigation.isFocused();

	const onRefresh = () => {
		setRefreshing(true);
		setId(Math.random().toString(36).substring(7));
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	};

	const [events, setEvents] = React.useState([]);
	const [query, setQuery] = React.useState("");
	const [loading, setLoading] = React.useState(true);

	const getEvents = (clear = undefined, searching = undefined, query = undefined) => {
		const clean = (searching && query !== "") || clear;
		HTTPClient(`/events?skip=${clean ? 0 : events.length}` + String(query ? "&q=" + query : ""), "GET").then((res) => {
			if (res.data.events.length !== 0) setEvents(clean ? [...res.data.events] : [...events, ...res.data.events]);
			else if (clear) setEvents([]);
			setLoading(false);
		}).catch(err => {
			// alert("An error occurred while loading your events. Please try again later.")
		})
	}

	useEffect(() => {
		(async () => {
			if (!(await AsyncStorage.getItem("@session"))) {
				navigation.navigate("Auth");
			}
			getEvents();
		})();
	}, []);

	useEffect(() => {
		onRefresh();
	}, [route.params?.updatedId]);

	useEffect(() => {
		(async () => {

			await AsyncStorage.getItem("@first").then((value) => {
				setRefreshing(false)
				if (value === null) {
					setFirstLoad(true);
				} else {
					setFirstLoad(false);
				}
			});
			if (isFocused && route.params?.refresh) {
				setRefreshing(true);
				onRefresh();
			}
		})();
	});



	return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
		{!firstLoad ? <View style={{ flexDirection: "row", marginLeft: 5, marginRight: 10, alignContent: "flex-end" }}>
			<FastImage style={{ width: 35, height: 35 }} source={require("../assets/icons/collection/timestack.png")} />
			<TextInput style={{ borderRadius: 10, backgroundColor: "#F2F2F2", margin: 5, marginTop: 5, padding: 6, fontFamily: "Red Hat Display Regular", width: "90%" }} placeholder="Search" onChangeText={(text) => {
				setQuery(text);
				getEvents(true, true, text);
			}} />
		</View> : null}
		{!firstLoad ? <View style={{
			borderBottomColor: '#E5E5E5',
			borderBottomWidth: 1,
			marginBottom: 5,
			paddingBottom: 0
		}}>
			<Text style={{ fontSize: 30, marginHorizontal: 10, marginTop: 5, marginBottom: 5, fontFamily: "Red Hat Display Semi Bold" }}>My Timewall</Text>
		</View> : null}

		{!firstLoad ? <View style={{ flex: 1, paddingTop: 0 }}>
			{events.length === 0 && !query && !loading ? <Image style={{ marginLeft: "2%", width: "96%", height: "100%", resizeMode: "contain" }} source={require("../assets/timewall.png")} /> : <FlatList
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => getEvents(true)} />}
				data={events}
				renderItem={(raw) => {
					const event = raw.item;
					return <TouchableWithoutFeedback onPress={() => navigation.navigate("Event", {
						eventId: event.publicId,
						eventName: event.name,
						eventLocation: event.location,
						thumbnailUrl: event.thumbnailUrl,
					})}>
						<View style={{ flexDirection: "row", flex: 1, ...styles.shadow, margin: 10, borderRadius: 15, height: 125 }}>
							<View style={{ flex: 3 }}>
								<TimestackMedia style={{
									width: "100%",
									height: "100%",
									borderRadius: 15,
									objectFit: "cover",
									borderColor: "black",
									borderWidth: 1,
								}} source={event?.thumbnailUrl} />
							</View>
							<View style={{ flex: 8, paddingLeft: 10, paddingTop: 10, zIndex: 10 }}>
								<Text style={{
									fontSize: 15,
									fontFamily: "Red Hat Display Semi Bold",
									marginRight: 5
								}}>{event.name}</Text>
								<View style={{ justifyContent: "flex-end", flex: 1 }}>
									<Text style={{ fontSize: 12, fontFamily: "Red Hat Display Regular", marginTop: 5 }}>{event.location}</Text>
									<Text style={{ fontSize: 12, fontFamily: "Red Hat Display Regular", marginTop: 0 }}>{dateFormatter(new Date(event?.startsAt), event?.endsAt ? new Date(event?.endsAt) : null)}</Text>
								</View>
								<View style={{
									flexDirection: 'row',
									alignItems: 'center',
									marginVertical: 5,
								}}>

									{event?.people ? [...event?.people].map((user, i) => {
										if (i === 6 && event?.peopleCount > 7) {
											return (
												<View style={{ marginRight: 5 }}>
													<View style={{
														backgroundColor: "black",
														opacity: 0.6,
														zIndex: 1,
														position: "absolute",
														right: 0,
														bottom: 0,
													}}>
														<Text>{event.peopleCount - 6}</Text>
													</View>
													<ProfilePicture
														key={i}
														width={iconWidth}
														height={iconWidth}
														location={user.profilePictureSource}
													/>
												</View>
											);
										} else {
											return (
												<ProfilePicture
													key={i}
													style={{ marginRight: 5 }}
													width={iconWidth}
													height={iconWidth}
													location={user.profilePictureSource}
												/>
											);
										}
									}) : null}

								</View>
							</View>
							<View style={{ flex: 2, paddingTop: 15, flexDirection: "row", justifyContent: 'flex-end' }}>
								<Text style={{ fontSize: 12, fontFamily: "Red Hat Display Semi Bold", paddingTop: -10 }}>{event?.mediaCount}</Text>
								<FastImage style={{ width: 10, height: 10, marginTop: 3, marginLeft: 2, marginRight: 15 }} source={require("../assets/icons/collection/picture.png")} />

							</View>
						</View>
					</TouchableWithoutFeedback>
				}}
				numColumns={1}
				keyExtractor={(item, index) => index.toString()}
				onEndReached={() => getEvents(false)}
				onEndReachedThreshold={0.5}
				style={{ flex: 1, paddingTop: 0 }}
			/>}
		</View> : <Onboarding setFirstLoad={setFirstLoad} />}
	</SafeAreaView>

}

const iconWidth = 25;


const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	shadow: {
		backgroundColor: 'white',
		shadowColor: 'black',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 0,
	},
});