import {
	View,
	Text,
	SafeAreaView,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	StyleSheet,
	Image,
	ScrollView, Share, RefreshControl, FlatList
} from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import HTTPClient from "../httpClient";
import {useEffect, useState} from "react";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import Main from "../Main";
import Constants from "expo-constants";
import * as React from "react";
import FastImage from "react-native-fast-image";
import {dateFormatter} from "../utils/time";
import ProfilePicture from "../Components/ProfilePicture";

const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;

const options = [
	{ label: 'Java', value: 'java' },
	{ label: 'JavaScript', value: 'js' },
	{ label: 'Python', value: 'python' },
];

function Picker(props) {
	return null;
}

function ReusableHiddenItem(props) {
	return null;
}

export default function EventScreen () {

	const route = useRoute();
	const navigation = useNavigation();

	const [refreshing, setRefreshing] = React.useState(false);
	const [id, setId] = React.useState("null");

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		setId(Math.random().toString(36).substring(7));
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const [event, setEvent] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");
	const [gallery, setGallery] = useState([]);
	const [moreToLoad, setMoreToLoad] = useState(true);
	const [viewMenu, setViewMenu] = useState(false);

	const getGallery = () => HTTPClient(`/events/${route.params.eventId}/media?skip=${gallery.length}`, "GET")
		.then(res => {
			setGallery([...gallery, ...res.data.media]);
			if (res.data.media.length === 0) setMoreToLoad(false);
		});

	const fetchEvent = () => {

		setPlaceholder(route.params?.eventPlaceholder)


		navigation.setOptions({
			headerShown: true,
			headerBackTitleStyle: {
				fontSize: 200,
			},
			headerRight: () => (

				<HeaderButtons>
					<TouchableOpacity onPress={async () => {
						await Share.share({
							url: frontendUrl + "/event/" + route.params.eventId+"/invite",
							title: "Timestack"
						});}
					}>
						<Image source={require("../assets/icons/collection/share.png")} style={{width: 30, height: 30}} />
					</TouchableOpacity>
					<OverflowMenu
						style={{ marginHorizontal: 10, marginRight: -10 }}
						OverflowIcon={({ color }) =><View color="#000" style={{color: "black"}} onPress={() => {
						}} title="Update count">
							<TouchableOpacity>
								<Image source={require("../assets/icons/collection/three-dots.png")} style={{width: 35, height: 35}} />
							</TouchableOpacity>
						</View>}
					>
						<HiddenItem style={{color: "red"}} title="Edit" onPress={() => navigation.navigate("EditEvent", {
							eventId: route.params.eventId,
							eventName: route.params.eventName
						})
						} />
						<HiddenItem style={{color: "red"}} title="Leave" onPress={() => {
							Alert.alert("Leave event", "Are you sure you want to leave this event?", [
								{
									text: "Cancel",
									onPress: () => {},
									style: "cancel"
								},
								{
									text: "Leave",
									onPress: () => {
										HTTPClient("/events/"+route.params.eventId+"/leave", "POST")
											.then((response) => {
												navigation.navigate("Main", {
													updatedId: Math.random().toString(36).substring(7)
												});
											})
											.catch((error) => {
												Alert.alert("Error", "Could not leave event", [
													{
														text: "OK",

													}
												])
												console.log(error);
												// window.location.href = "/main_ios";
											});
									}
								}
							])
						}} />
						<ReusableHiddenItem onPress={() => alert('hidden2')} />
					</OverflowMenu>
				</HeaderButtons>

			),
		});


		HTTPClient("/events/"+route.params.eventId+"?noBuffer=true", "GET")
			.then((response) => {

				setEvent(response.data.event);
				setLoaded(true);
				getGallery();

				HTTPClient("/media/"+response.data.event.cover+"?thumbnail=true").then(res => setUri(res.data))
					.catch(err => {});

			})
			.catch((error) => {
				Alert.alert("Error", "Could not load event", [
					{
						text: "OK",
						onPress: () => {
							navigation.goBack();
						}
					}
				])
				console.log(error);
			});
	};

	useEffect(() => {
		if(id !== route.params?.updateId) {
			setId(route.params?.updateId);
		}

	}, [route.params, id])

	useEffect(() => {
		fetchEvent();
	}, [])

// 	<ScrollView
// 	// scrollEnabled={false}
// 	refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvent} />}
// 	contentContainerStyle={{flexGrow: 1}}
// 	style={{flex: 1, height: "100%", backgroundColor: "white"}}								navigation.navigate("Upload", {eventId: event?._id, event:event})}
// >

	return <View style={{flex: 1, backgroundColor: "white"}}>
		<View style={{zIndex: 2, margin: 10, position: "absolute", bottom: 0, flexDirection: "row"}}>
			<TouchableWithoutFeedback style={{}} onPress={() => setViewMenu(!viewMenu)}>
				<Image source={require("../assets/icons/collection/action_button.png")} style={{width: 45, height: 45}} />
			</TouchableWithoutFeedback>
			{viewMenu ? (
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity onPress={() => {
						// setUpdatingPeople(true);
							setViewMenu(false);
						}}
						style={styles.actionButton}
					>
						<Text style={styles.actionButtonText}>People</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => {
							navigation.navigate("Upload", {eventId: event?._id, event:event});
							setViewMenu(false);
						}}
	                    style={styles.actionButton}
					>
						<Text style={styles.actionButtonText}>Upload</Text>
					</TouchableOpacity>
				</View>
			) : null}
		</View>
		<FlatList
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvent} />}
			style={{height: "100%", width: "100%", position: "absolute", top: 0, zIndex: 1}}
			ListHeaderComponent={
				<View>


					<View style={{flexDirection: "row"}}>
						<View style={{flex: 2, margin: 10}}>
							<FastImage source={
								{uri: "data:image/png;base64,"+placeholder}
							} style={{
								width: "100%",
								height: 200,
								borderRadius: 10,
							}} />
						</View>
						<View style={{flex: 3, margin: 10, flexDirection: "column", height: 200,marginLeft: 0}}>
							<View style={{flex: 1, flexDirection: "row"}}>
								<Text
									style={{
										fontSize: 20,
										fontFamily: "Red Hat Display Bold"
									}}
								>
									{event?.name}
								</Text>
							</View>
							<View style={{flex: 1, flexDirection: "column", justifyContent: "flex-end"}}>
								<Text
									style={{
										fontSize: 15,
										fontFamily: "Red Hat Display Regular"
									}}
								>
									{event?.location}
								</Text>
								<Text
									style={{
										fontSize: 15,
										fontFamily: "Red Hat Display Regular"
									}}
								>
									{dateFormatter(String(event?.startsAt), String(event?.startsAt))}
								</Text>
							</View>
						</View>
					</View>
					<View>
						<View style={{flexDirection: "row", margin: 15}}>
							<View style={{flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
								<Text style={styles.counterNumber} numberOfLines={1}>
									{event?.peopleCount}
								</Text>
								<Text style={styles.counterText} numberOfLines={1}>
									People
								</Text>
							</View>
							<View style={{flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
								<Text style={styles.counterNumber} numberOfLines={1}>
									{event?.mediaCount}
								</Text>
								<Text style={styles.counterText} numberOfLines={1}>
									Memories
								</Text>
							</View>
							<View style={{flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}}>
								<Text style={styles.counterNumber} numberOfLines={1}>
									0
								</Text>
								<Text style={styles.counterText} numberOfLines={1}>
									Revists
								</Text>
							</View>

						</View>
						<View style={{flexDirection: 'row',
							alignItems: 'center',
							marginLeft: 10, marginVertical: 15, marginTop: 10}}>

							{event?.people ? [...event?.people].map((user, i) => {
								if (i === 5 && event?.peopleCount > 7) {
									return (
										<View style={{marginRight: 5}}>
											<View style={{
												...styles.badge,
												backgroundColor: "black",
												opacity: 0.6,
												zIndex: 1,
												position: "absolute",
												right: 0,
												bottom: 0,
											}}>
												<Text style={styles.badgeText}>{event.peopleCount - 6}</Text>
											</View>
											<ProfilePicture
												key={i}
												// style={{opacity: 0.6, }}
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
				</View>
			}
			data={[
				...gallery,
			]}
			numColumns={3}
			renderItem={raw => {
				const media = raw.item;

				return <View style={{width: '33%', // 30% to account for space between items
					backgroundColor: "#efefef",
					height: 180,
					margin: 0.5}}>
					<FastImage  alt={"Cassis 2022"} style={{borderRadius: 0, width: "100%", height: 180}} source={{uri: media.thumbnail}}/>
				</View>
			}}
			keyExtractor={(item, index) => index.toString()}
			onEndReached={() => getGallery()}
			onEndReachedThreshold={1.5}
			nestedScrollEnabled={true}
		>

		</FlatList>
	</View>



}

const iconWidth = 47;
const styles = StyleSheet.create({
	counterNumber: {
		fontSize: 18,
		fontFamily: "Red Hat Display Semi Bold",
		marginBottom: -3,
	},
	counterText: {
		fontSize: 18,
		fontFamily: "Red Hat Display Semi Bold",
		color: "grey"
	},
	badge: {
		width: iconWidth,
		height: iconWidth,
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
	badgeText: {
		color: '#ffffff',
			fontSize: 20,
	},
	actionButton: {
		height: 45,
		borderRadius: 45,
		backgroundColor: "black",
		opacity: 1,
		marginLeft: 10,
		paddingHorizontal: 30,
		alignContent: "center",
		justifyContent: "center",
	},
	actionButtonText: {
		color: "white",
		fontSize: 25,
		fontFamily: "Red Hat Display Semi Bold"
	}
});