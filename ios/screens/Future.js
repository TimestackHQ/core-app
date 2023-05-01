import * as React from "react";
import Viewer from "../Components/Viewer";
import {Alert, RefreshControl, SafeAreaView, ScrollView, Text, View} from "react-native";
import {useEffect} from "react";
import HTTPClient from "../httpClient";
import ProfilePicture from "../Components/ProfilePicture";

export default function FutureScreen({navigation}) {
	const [refreshing, setRefreshing] = React.useState(false);
	const [eventsCount, setEventsCount] = React.useState(0);
	const [people, setPeople] = React.useState([]);

	const load = () => {
		HTTPClient("/people/future", "GET")
			.then((response) => {
				setPeople(response.data.people);
				setEventsCount(response.data.eventsCount);
			})
			.catch((_error) => {
				Alert.alert("Error", "Count not load.", [{
					text: "Try again",
					onPress: () => {
						load();
					}
				}]);
			});
	};

	useEffect(load, []);

	return <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
		<ScrollView
			// scrollEnabled={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
			contentContainerStyle={{flexGrow: 1}}
			style={{flex: 1, height: "100%", backgroundColor: "white", paddingHorizontal: 20,
				marginTop: 5
			}}
		>
			<Text style={{
				fontSize: 28,
				fontFamily: "Red Hat Display Semi Bold",
				marginBottom: 10,
			}}>
				My People
			</Text>
			<Text style={{
				fontSize: 15,
				fontFamily: "Red Hat Display Semi Bold",
			}}>{eventsCount} {eventsCount === 1 ? "Event" : "Events"}</Text>
			<View style={{
				height: 1,
				marginVertical: 10,
				backgroundColor: "#8E8E93",
			}}/>
			{[...people].map((user, index) => {
				return <View key={index} style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 15,
				}}>
					<View style={{flex: 1}}>
						<ProfilePicture
							location={user?.profilePictureSource}
							width={50}
							height={50}
						/>
					</View>
					<View style={{flex: 3}}>
						<Text style={{
							fontSize: 17,
							fontFamily: "Red Hat Display Bold",
						}}>
							{user.firstName} {user.lastName}
						</Text>
						<Text style={{
							fontSize: 13,
							fontFamily: "Red Hat Display Regular",
							color: "gray",
							marginTop: -3
						}}>
							@{user.username}
						</Text>
					</View>
					<View style={{flex: 1}}>
						<Text style={{
							fontSize: 13,
							fontFamily: "Red Hat Display Regular",
							color: "gray",
						}}>
							{user.eventsCount} {user.eventsCount === 1 ? "Event" : "Events"}
						</Text>
					</View>
				</View>
			})}
		</ScrollView>
	</SafeAreaView>
}
