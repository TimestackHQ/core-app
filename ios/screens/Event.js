import {
	View,
	Text,
	SafeAreaView,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Image,
	ScrollView, Share, RefreshControl
} from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import HTTPClient from "../httpClient";
import {useEffect, useState} from "react";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import Main from "../Main";
import Constants from "expo-constants";
import * as React from "react";

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


	const fetchEvent = () => {

		navigation.setOptions({
			// fontColor: "blue",
			headerShown: true,
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


		// HTTPClient("/events/"+route.params.eventId, "GET")
		// 	.then((response) => {
		//
		// 		if(response.data.message === "joinRequired") {
		// 			// Router.push("/event/"+eventId+"/join");
		// 		}else {
		// 			setEvent(response.data.event);
		// 			setLoaded(true);
		//
		// 			HTTPClient("/media/"+response.data.event.cover+"?snapshot=true").then(res => setPlaceholder(res.data))
		// 				.catch(err => {});
		// 			HTTPClient("/media/"+response.data.event.cover+"?thumbnail=true").then(res => setUri(res.data))
		// 				.catch(err => {});
		// 		}
		//
		// 	})
		// 	.catch((error) => {
		// 		Alert.alert("Error", "Could not load event", [
		// 			{
		// 				text: "OK",
		// 				onPress: () => {
		// 					navigation.goBack();
		// 				}
		// 			}
		// 		])
		// 		console.log(error);
		// 		// window.location.href = "/main_ios";
		// 	});
	};

	useEffect(() => {
		if(id !== route.params?.updateId) {
			setId(route.params?.updateId);
		}

	}, [route.params, id])

	useEffect(() => {
		fetchEvent();
	}, [])

	return <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
		<ScrollView
			// scrollEnabled={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			contentContainerStyle={{flexGrow: 1}}
			style={{flex: 1, height: "100%", backgroundColor: "white"}}
		>

			<Main
				baseRoute={"/event/"+route.params.eventId+"?id="+id+"&name="+route.params.eventName+"&openUpload="+route.params.openUpload}
				apiUrl={apiUrl}
				frontendUrl={frontendUrl}
				navigation={navigation}
			/>
		</ScrollView>
	</SafeAreaView>



}