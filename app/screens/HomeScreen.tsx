import {
	RefreshControl,
	SafeAreaView,
	View,
	FlatList,
	TextInput,
	ScrollView, Platform
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HTTPClient from "../httpClient";
import { EventBannerButton } from "../Components/Events/EventBannerButton";
import CreateEvent from "../Components/Skeletons/CreateEvent";
import TextComponent from "../Components/Library/Text";
import ListOfPeople from "../Components/People/List";
import SmallButton from "../Components/Library/SmallButton";
import MaterialCommunityIcon from "@expo/vector-icons/MaterialCommunityIcons";
import IconBadge from 'react-native-icon-badge';
import { BlurView } from "@react-native-community/blur";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
	AddScreenNavigationProp,
	AuthScreenNavigationProp,
	EventScreenNavigationProp,
	NotificationsScreenNavigationProp
} from "../navigation";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useQuery, useQueryClient } from "react-query";
import { getPeople } from "../queries/people";
import { listProfiles } from "../queries/profiles";
import { PeopleSearchResult } from "@api-types/api";
import {SearchBar} from "react-native-elements";
import {getEvents} from "../queries/events";
import MaterialIcon from "@expo/vector-icons/MaterialIcons";
import TimestackMedia from "../Components/TimestackMedia";

export default function HomeScreen({ route }) {

	const [refreshing, setRefreshing] = React.useState(true);
	const isFocused = useIsFocused();
	const navigation = useNavigation<
		AuthScreenNavigationProp |
		NotificationsScreenNavigationProp |
		EventScreenNavigationProp
	>();

	// const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = React.useState("");
	const { data: people, status: peopleStatus } = useQuery(["people", { searchQuery }], getPeople, {
		enabled: searchQuery !== "",
	});

	const { data: events, status: eventsStatus, refetch: refreshEvents } = useQuery(["events", {}], getEvents);
	const { data: profiles, status: profilesStatus, refetch: refreshProfiles } = useQuery(["profiles", { searchQuery }], listProfiles, {
	});

	const onRefresh = () => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	};

	useEffect(() => {
		(async () => {
			if (!(await AsyncStorage.getItem("@session"))) {
				navigation.navigate("Auth");
			}
		})();
	}, []);

	useEffect(() => {
		onRefresh();
	}, [route.params?.updatedId]);

	useEffect(() => {
		console.log("people", people);
	}, [people]);

	return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
		<View style={{ flexDirection: "row", marginLeft: 5, marginRight: 10, alignContent: "flex-end", alignItems: "center" }}>
			<View style={{flex: 1}}>
				<SearchBar
					platform={Platform.OS === "ios" ? "ios" : "android"}
					round={true} cancelButtonTitle={""}  showCancel={false}
					showLoading={peopleStatus === "loading"}

				   containerStyle={{
					   flex: 1,
					   borderRadius: 10,
					   backgroundColor: "#F2F2F2",
				   }}

					inputContainerStyle={{
						flex: 1,
						borderRadius: 10,
						backgroundColor: "#F2F2F2",
					}}

					inputStyle={{
						fontSize: 16,
						fontFamily: "Red Hat Display Regular",

					}}
				   cancelButtonProps={{ color: "black" }}
				   onChangeText={(text) => {setSearchQuery(text)}}
				   value={searchQuery}
				 lightTheme/>
			</View>
			{/*<TextInput style={{ flex: 1, fontSize: 16, borderRadius: 10, backgroundColor: "#F2F2F2", margin: 5, marginTop: 5, padding: 10, fontFamily: "Red Hat Display Regular" }} placeholder="Search" onChangeText={setSearchQuery} />*/}
			<TouchableOpacity onPress={() => navigation.push("Notifications")}>
				<IconBadge
					IconBadgeStyle={
						{
							// width: 10,
							height: 20,
							paddingHorizontal: 5,
							backgroundColor: '#FF3B30'
						}
					}
					// Hidden={this.state.BadgeCount == 0}
					BadgeElement={
						<TextComponent fontFamily="Semi Bold" fontSize={13} style={{ color: "white" }}>4</TextComponent>
					}
					MainElement={<MaterialCommunityIcon
						size={28}
						style={{ alignSelf: "center", margin: 5, borderColor: "green" }}
						name="bell-outline"
					/>}
				/>
			</TouchableOpacity>
		</View>

		{searchQuery === "" ? <React.Fragment>
			<View style={{ paddingTop: 10, paddingVertical: 10 }}>
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
									padding:10,
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
						refresh={() => {}}
						people={people?.people || []}
						style={{ height: "100%", paddingTop: 50, padding: 10 }}
						loading={peopleStatus === "loading"}
					/>
				</View>
			</View>
		</React.Fragment>}

	</SafeAreaView>

}
