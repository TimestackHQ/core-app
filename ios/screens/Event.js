import {
	View,
	Text,
	SafeAreaView,
	Alert,
	Button,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Image,
	ScrollView, Share
} from "react-native";
import { useRoute, useNavigation } from '@react-navigation/native';
import HTTPClient from "../httpClient";
import {useEffect, useState} from "react";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import Main from "../Main";
import Constants from "expo-constants";

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

export default function Event () {

	const route = useRoute();
	const navigation = useNavigation();

	const [event, setEvent] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");

	console.log(route);

	const fetchEvent = () => {

		navigation.setOptions({

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
						<HiddenItem style={{color: "red"}} title="Edit" onPress={() => alert('hidden1')} />
						<HiddenItem style={{color: "red"}} title="Leave" onPress={() => alert('hidden1')} />
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
		fetchEvent();
	}, [])

	return <View style={{backgroundColor: "white", flex: 1, flexDirection: "column"}}>

			<Main
				baseRoute={"/event/"+route.params.eventId+"?name="+route.params.eventName}
				apiUrl={apiUrl}
				frontendUrl={frontendUrl}
				navigation={navigation}
			/>
		</View>

		{/*<Picker>*/}
		{/*	{options.map((option) => (*/}
		{/*		<Picker.Item*/}
		{/*			key={option.value}*/}
		{/*			label={option.label}*/}
		{/*			value={option.value}*/}
		{/*		/>*/}
		{/*	))}*/}
		{/*</Picker>*/}
		{/*<Text>{event?.name}</Text>*/}



}