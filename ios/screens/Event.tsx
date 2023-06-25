import {
	View,
	Text,
	Alert,
	TouchableWithoutFeedback,
	TouchableOpacity,
	StyleSheet,
	Image,
	Share, RefreshControl, FlatList
} from "react-native";
import { useRoute, useNavigation, useIsFocused, RouteProp } from '@react-navigation/native';
import HTTPClient from "../httpClient";
import { useEffect, useState } from "react";
import { HeaderButtons, HiddenItem, OverflowMenu } from "react-navigation-header-buttons";
import * as React from "react";
import FastImage from "react-native-fast-image";
import { dateFormatter } from "../utils/time";
import ProfilePicture from "../Components/ProfilePicture";
import { Hyperlink } from "react-native-hyperlink";
import * as WebBrowser from 'expo-web-browser';
import TimestackMedia from "../Components/TimestackMedia";
import { InviteScreenNavigationProp, RootStackParamList, SocialProfileScreenNavigationProp, UploadScreenNavigationProp } from "../navigation";
import { frontendUrl } from "../utils/io";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";


function Picker(props) {
	return null;
}

function ReusableHiddenItem(props) {
	return null;
}

function formatNumber(num) {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(0) + 'M';
	}
	if (num >= 10000) {
		return (num / 1000).toFixed(0) + 'K';
	}
	return num;
}

function AboutViewer({ about }) {

	return <Hyperlink onPress={async (url, text) => {
		await WebBrowser.openBrowserAsync(url);
	}}>
		<Text style={{
			fontSize: 15,
			fontFamily: "Red Hat Display Regular",
			marginBottom: 50,
		}}>{about ? about : "No description (TBD)"}</Text>
	</Hyperlink>

}

function EventCoverNoCover(props) {
	return null;
}

function Headers({
	route,
	navigation,
	event,
}) {

	const [muted, setMuted] = useState(event?.muted);
	return <HeaderButtons>
		<TouchableOpacity onPress={async () => {
			ReactNativeHapticFeedback.trigger("notificationSuccess");
			HTTPClient("/events/" + route.params.eventId + "/mute", "POST")
				.then((response) => {
					setMuted(response.data.muted)
					if (response.data.muted) {
						Alert.alert("Muted", "You will no longer receive notifications for this event.");
					} else {
						Alert.alert("Unmuted", "You will now receive notifications for this event.");
					}
				})
				.catch((err) => {
					console.log(err);
				})
		}}
			style={{ marginRight: 10, marginTop: 2 }}
		>
			<Image source={muted ? require("../assets/icons/collection/unmute.png") : require("../assets/icons/collection/mute.png")} style={{ width: 30, height: 30 }} />
		</TouchableOpacity>
		<TouchableOpacity onPress={async () => {
			await Share.share({
				url: frontendUrl + "/event/" + route.params.eventId + "/invite",
				title: "Timestack"
			});
		}
		}>
			<Image source={require("../assets/icons/collection/share.png")} style={{ width: 30, height: 30 }} />
		</TouchableOpacity>
		<OverflowMenu
			style={{ marginHorizontal: 10, marginRight: -10, zIndex: 100 }}
			OverflowIcon={({ color }) => <TouchableOpacity onPress={() => {
				alert("Update count");
			}}>
				<Image source={require("../assets/icons/collection/three-dots.png")} style={{ width: 35, height: 35 }} />
			</TouchableOpacity>}
		>
			{event?.hasPermission ? <HiddenItem title="Edit" onPress={() => navigation.navigate("EditEvent", {
				eventId: route.params.eventId,
				eventName: route.params.eventName
			})
			} /> : null}
			<HiddenItem title="Leave" onPress={() => {
				Alert.alert("Leave event", "Are you sure you want to leave this event?", [
					{
						text: "Cancel",
						onPress: () => { },
						style: "cancel"
					},
					{
						text: "Leave",
						onPress: () => {
							HTTPClient("/events/" + route.params.eventId + "/leave", "POST")
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
									// window.location.href = "/main_ios";
								});
						}
					}
				])
			}} />
			<ReusableHiddenItem onPress={() => alert('hidden2')} />
		</OverflowMenu>
	</HeaderButtons>
}

export default function EventScreen() {

	const route = useRoute<RouteProp<RootStackParamList, "Event">>();
	const navigation = useNavigation<
		InviteScreenNavigationProp |
		UploadScreenNavigationProp |
		SocialProfileScreenNavigationProp
	>();
	const isFocused = useIsFocused();

	const [refreshing, setRefreshing] = React.useState(false);
	const [refreshEnabled, setRefreshEnabled] = React.useState(true);
	const [uploadUsed, setUploadUsed] = React.useState(false);
	const [tab, setTab] = React.useState("memories");

	const [event, setEvent] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [uri, setUri] = useState("");
	const [gallery, setGallery] = useState([]);
	const [moreToLoad, setMoreToLoad] = useState(true);
	const [viewMenu, setViewMenu] = useState(false);

	const refresh = () => {
		fetchEvent();
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}

	const getGallery = (flush = false) => {
		setGallery(flush ? [] : gallery)
		HTTPClient(`/events/${route.params.eventId}/media?skip=${String(flush ? 0 : gallery.length)}`, "GET")
			.then(res => {
				setGallery(flush ? [...res.data.media] : [...gallery, ...res.data.media]);
				if (res.data.media.length === 0) setMoreToLoad(false);
			});
	}

	const fetchEvent = () => {

		setEvent({
			name: route.params?.eventName,
		})

		HTTPClient("/events/" + route.params.eventId, "GET")
			.then((response) => {

				if (response.data?.message === "joinRequired") {
					navigation.navigate("Invite", {
						eventId: route.params?.eventId
					});
				}

				navigation.setOptions({
					headerShown: true,
					headerBackTitleStyle: {
						fontSize: 200,
					},
					headerRight: () => <Headers
						route={route}
						navigation={navigation}
						event={response.data.event}
					/>,
				});

				setEvent(response.data.event);
				setLoaded(true);
				getGallery(true);

				if (!uploadUsed) {
					if (route.params?.openUpload) {
						setTimeout(() => {
							navigation.navigate("Upload", {
								eventId: response.data.event?._id, event: response.data.event
							});
							setUploadUsed(true);
						}, 1000);
					}
				}



				HTTPClient("/media/" + response.data.event.cover + "?snapshot=true").then(res => setUri(res.data))
					.catch(err => { });

			})
			.catch((error) => {
				Alert.alert("Error", "Could not load event" + JSON.stringify(error), [
					{
						text: "OK",
						onPress: () => {
							navigation.goBack();
						}
					}
				])
			})






	};

	useEffect(() => {
		if (isFocused) {
			HTTPClient("/events/" + route.params.eventId + "?noBuffer=true").then(res => {
				if (
					(res.data.event?.mediaCount !== event?.mediaCount)
					|| (res.data.event?.name !== event?.name)
					|| (res.data.event?.location !== event?.location)
					|| (res.data.event?.about !== event?.about)
					|| (res.data.event?.startsAt !== event?.startsAt)
					|| (res.data.event?.endsAt !== event?.endsAt)
					|| (res.data.event?.cover !== event?.cover)
					// || (res.data.event?.peopleCount !== event?.peopleCount)
				) {
					refresh();
				}
			});
		}

	}, [isFocused]);

	const peopleScreenNav = () => {
		navigation.navigate("AddPeople", { eventId: event?._id, event: event });
		setViewMenu(false);
	}


	useEffect(() => {
		fetchEvent()
		if (route?.params?.refresh) setRefreshEnabled(true);
		setRefreshEnabled(false);

	}, [])


	return !loaded ? <View style={{ flex: 1, backgroundColor: "white" }} /> : <View style={{ flex: 1, backgroundColor: "white" }}>
		<View style={{ zIndex: 2, margin: 10, position: "absolute", bottom: 0, flexDirection: "row" }}>
			<TouchableWithoutFeedback style={{}} onPress={() => setViewMenu(!viewMenu)}>
				<FastImage source={require("../assets/icons/collection/action_button.png")} style={{ width: 45, height: 45 }} />
			</TouchableWithoutFeedback>
			{viewMenu ? (
				<View style={{ flexDirection: 'row' }}>
					<TouchableOpacity onPress={peopleScreenNav}
						style={styles.actionButton}
					>
						<Text style={styles.actionButtonText}>People</Text>
					</TouchableOpacity>
					{event?.hasPermission ? <TouchableOpacity onPress={() => {
						navigation.navigate("Upload", { eventId: event?._id, event: event });
						setViewMenu(false);
					}}
						style={styles.actionButton}
					>
						<Text style={styles.actionButtonText}>Upload</Text>
					</TouchableOpacity> : null}
				</View>
			) : null}
		</View>
		<FlatList
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvent} />}
			style={{ height: "100%", width: "100%", position: "absolute", top: 0, zIndex: 1 }}
			ListHeaderComponent={
				<View>


					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 2, margin: 10 }}>
							<TimestackMedia source={event?.thumbnailUrl} style={{
								width: "100%",
								height: 200,
								borderRadius: 10,
							}} />
						</View>
						<View style={{ flex: 3, margin: 10, flexDirection: "column", height: 200, marginLeft: 0 }}>
							<View style={{ flex: 1, flexDirection: "row" }}>
								<Text
									style={{
										fontSize: 20,
										fontFamily: "Red Hat Display Bold"
									}}
								>
									{event?.name}
								</Text>
							</View>
							<View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-end" }}>
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
									{event?.startsAt ? dateFormatter(new Date(event?.startsAt), event?.endsAt ? new Date(event?.endsAt) : null) : ""}
								</Text>
							</View>
						</View>
					</View>
					<View>
						<View style={{ flexDirection: "row", margin: 15 }}>
							<TouchableWithoutFeedback onPress={peopleScreenNav}>
								<View style={{ flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
									<Text style={styles.counterNumber} numberOfLines={1}>
										{event?.peopleCount}
									</Text>
									<Text style={styles.counterText} numberOfLines={1}>
										People
									</Text>
								</View>
							</TouchableWithoutFeedback>

							<View style={{ flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
								<Text style={styles.counterNumber} numberOfLines={1}>
									{event?.mediaCount}
								</Text>
								<Text style={styles.counterText} numberOfLines={1}>
									{event?.mediaCount === 1 ? "Memory" : "Memories"}
								</Text>
							</View>
							<View style={{ flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
								<Text style={styles.counterNumber} numberOfLines={1}>
									{formatNumber(event?.revisits)}
								</Text>
								<Text style={styles.counterText} numberOfLines={1}>
									{event?.revisits === 1 ? "Revisit" : "Revisits"}
								</Text>
							</View>

						</View>
						<TouchableWithoutFeedback >
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginLeft: 10, marginVertical: 15, marginTop: 10
							}}>

								{event?.people ? [...event?.people].map((user, i) => {
									if (i === 6 && event?.peopleCount > 7) {
										return (
											<TouchableWithoutFeedback style={{ marginRight: 5 }}>
												<View>
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
														userId={user?._id}
														width={iconWidth}
														height={iconWidth}
														location={user.profilePictureSource}
													/>
												</View>
											</TouchableWithoutFeedback>
										);
									} else {
										return (
											<ProfilePicture
												key={i}
												userId={user._id}
												style={{ marginRight: 5 }}
												width={iconWidth}
												height={iconWidth}
												location={user.profilePictureSource}
												pressToProfile={true}
											/>

										);
									}
								}) : null}

							</View>
						</TouchableWithoutFeedback>
						<View style={{ flexDirection: "row", marginTop: 10 }}>
							<View style={{
								flex: 1,
								marginBottom: -0.5,
								borderBottomWidth: 1,
								borderBottomColor: tab === "memories" ? "black" : "#8E8E93",
							}}>
								<TouchableOpacity style={{ width: "100%", alignItems: "center", justifyContent: "flex-end", }} onPress={() => setTab("memories")}>
									<Image
										source={
											tab === "memories" ?
												require("../assets/icons/collection/memories-black.png")
												: require("../assets/icons/collection/memories-gray.png")
										}
										style={{ width: 35, height: 35, resizeMode: "contain", marginBottom: 5 }}
									/>
								</TouchableOpacity>
							</View>
							<View style={{
								flex: 1,
								marginBottom: -0.5,
								borderBottomWidth: 1,
								borderBottomColor: tab === "about" ? "black" : "#8E8E93",
							}}>
								<TouchableOpacity style={{ width: "100%", alignItems: "center", justifyContent: "flex-end", }} onPress={() => setTab("about")}>
									<Image
										source={
											tab === "about" ?
												require("../assets/icons/collection/about-black.png")
												: require("../assets/icons/collection/about-gray.png")
										}
										style={{ width: 30, height: 30, resizeMode: "contain", marginBottom: 5 }}
									/>
								</TouchableOpacity>
							</View>
						</View>
						{tab === "about" ? <View style={{ margin: 10 }}>
							<AboutViewer about={event?.about} />
						</View> : null}
					</View>
				</View>
			}
			data={[
				...gallery,
			]}
			numColumns={3}
			renderItem={(raw) => {
				const media = raw.item;

				return <View style={{
					width: '33%', // 30% to account for space between items
					backgroundColor: "#efefef",
					opacity: tab !== "memories" ? 0 : 1,
					height: tab !== "memories" ? 0 : 180,
					margin: 0.5
				}}
				>
					<TouchableWithoutFeedback
						onPress={() => {
							navigation.navigate("MediaView", {
								mediaId: media._id,
								holderId: event?._id,
								holderType: "event",
								content: gallery,
								currentIndex: raw.index,
								hasPermission: event?.hasPermission
							})
						}
						}>
						<View>
							<TimestackMedia style={{ borderRadius: 0, width: "100%", height: 180 }} source={media.thumbnail} />
						</View>
					</TouchableWithoutFeedback>
				</View>
			}}
			keyExtractor={(item, index) => index.toString()}
			onEndReached={() => getGallery()}
			onEndReachedThreshold={3}
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