import {
	SafeAreaView,
	View,
	ScrollView, Platform
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CreateEvent from "../Components/Skeletons/CreateEvent";
import TextComponent from "../Components/Library/Text";
import ListOfPeople from "../Components/People/List";
import SmallButton from "../Components/Library/SmallButton";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import IconBadge from 'react-native-icon-badge';
import { BlurView } from "@react-native-community/blur";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
	AuthScreenNavigationProp,
	EventScreenNavigationProp,
	EventsListScreenNavigationProp,
	NotificationsScreenNavigationProp
} from "../navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useQuery } from "react-query";
import { getPeople } from "../queries/people";
import { listProfiles } from "../queries/profiles";
import { SearchBar } from "react-native-elements";
import { getEvents } from "../queries/events";
import TimestackMedia from "../Components/TimestackMedia";

export default function HomeScreen({ route }) {

	const [refreshing, setRefreshing] = React.useState(true);
	const isFocused = useIsFocused();
	const navigation = useNavigation<
		AuthScreenNavigationProp |
		NotificationsScreenNavigationProp |
		EventScreenNavigationProp |
		EventsListScreenNavigationProp
	>();

	// const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = React.useState("");
	const { data: people, status: peopleStatus } = useQuery(["people", { searchQuery, getConnectedOnly: false }], getPeople);

	const { data: events, status: eventsStatus, refetch: refreshEvents } = useQuery(["events", {}], getEvents);
	const { data: profiles, status: profilesStatus, refetch: refreshProfiles } = useQuery(["profiles", { searchQuery }], listProfiles, {
	});


	useEffect(() => {
		(async () => {
			if (!(await AsyncStorage.getItem("@session"))) {
				navigation.navigate("Auth");
			}
		})();
	}, []);

	useEffect(() => {
	}, [route.params?.updatedId]);

	useEffect(() => {

		refreshProfiles();
		refreshEvents();

	}, [isFocused]);

	useEffect(() => {
		console.log("people", people);
	}, [people]);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			// @ts-ignore
			headerSearchBarOptions: {
				visible: true,
				autoFocus: true,
				hideWhenScrolling: false,
				placeholder: "Search for people",
				onChangeText: (event) => {
					setSearchQuery(event.nativeEvent.text);
				}
			},
		});
	}, [navigation]);


	return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>

		{searchQuery === "" ? <React.Fragment>
			<View style={{ paddingTop: 0, paddingVertical: 10 }}>
				<TextComponent style={{ marginHorizontal: 10 }} fontFamily="Semi Bold" fontSize={16}>
					Events
				</TextComponent>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					style={{
						paddingLeft: 5,
					}}
					alwaysBounceHorizontal={false}
					overScrollMode="never"
					horizontal={true}
				>
					<CreateEvent />
					{events ? events.map((event, index) => {
						return <TouchableOpacity style={{
							width: 120,
							height: 160
						}} onPress={() => navigation.navigate("Event", {
							eventId: event._id,
						})}>
							<View style={{
								flex: 1,
								backgroundColor: 'rgba(241,241,241,0.15)',
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 18,
								margin: 5
							}}>
								<TextComponent fontFamily={"Athelas"} fontSize={16} style={{
									position: "absolute",
									zIndex: 1,
									textAlign: "center",
									padding: 10,
									height: "100%",
									color: event.thumbnailUrl ? "white" : "black",
								}}>{event.name}</TextComponent>
								<TimestackMedia itemInView={true} source={event.thumbnailUrl} style={{
									width: "100%",
									height: "100%",
									borderRadius: 18,
								}} />
							</View>
						</TouchableOpacity>
					}) : null}
				</ScrollView>

				<View style={{
					flexDirection: "row",
					justifyContent: "flex-end",
					alignItems: "center",
					paddingHorizontal: 10,
					paddingTop: 5,
				}}>
					<TouchableOpacity onPress={() => {
						navigation.navigate("EventsList");
					}}>
						<TextComponent
							style={{
								color: "gray",
							}}
							fontFamily="Semi Bold"
							fontSize={14}
						>
							Show All
						</TextComponent>
					</TouchableOpacity>
				</View>

			</View>

			<View style={{
				width: "100%",
				height: 1,
				backgroundColor: "rgba(60, 60, 67, 0.36)",
			}} />

			<View style={{

			}}>
				<View
					style={{
						top: 0,
						padding: 10,
						zIndex: 1,
						width: "100%",
						flexDirection: "row", justifyContent: "space-between", alignItems: "center"
					}}
				>
					<TextComponent fontFamily="Semi Bold" fontSize={16}>
						Recents
					</TextComponent>
					<SmallButton
						variant="positive"
						body="Add People"
						fontSize={16}
						width={120}
					/>
				</View>
				<View style={{
					paddingTop: 0
				}}>

					<ListOfPeople
						refresh={() => {
							refreshProfiles();
							refreshEvents();
						}}
						people={profiles}
						style={{ height: "100%", padding: 10, paddingTop: 0 }}
						loading={profilesStatus === "loading"}
					/>

				</View>
			</View>

		</React.Fragment> : <React.Fragment>
			<View style={{

			}}>
				<BlurView
					style={{
						position: "absolute",
						top: 0,
						padding: 10,
						zIndex: 1,
						width: "100%",
						flexDirection: "row", justifyContent: "space-between", alignItems: "center"
					}}
					blurType="light"
					blurAmount={20}
					reducedTransparencyFallbackColor="light"
				>
					<TextComponent fontFamily="Semi Bold" fontSize={16}>
						Recents
					</TextComponent>
					<SmallButton
						variant="positive"
						body="Add People"
						fontSize={16}
						width={120}
					/>
				</BlurView>
				<View style={{
					paddingTop: 0
				}}>
					<ListOfPeople
						refresh={() => { }}
						people={people?.people || []}
						style={{ height: "100%", paddingTop: 50, padding: 10 }}
						loading={peopleStatus === "loading"}
					/>
				</View>
			</View>
		</React.Fragment>}

	</SafeAreaView>

}
