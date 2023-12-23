import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import HTTPClient from "../httpClient";
import {
	Alert,
	SafeAreaView,
	ScrollView, Share,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import ProfilePicture from "../Components/ProfilePicture";
import FastImage from "react-native-fast-image";
import { RootStackParamList } from "../navigation";

const frontendUrl = Constants.expoConfig.extra.frontendUrl;


export default function AddPeople() {

	const route = useRoute<RouteProp<RootStackParamList, "AddPeople">>();
	const navigation = useNavigation();
	const isFocused = useIsFocused();
	const eventId = route.params?.eventId;

	const [selectionMode, setSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);

	const [search, setSearch] = useState("");
	const [people, setPeople] = useState<any[]>([]);
	const [addPeople, setAddPeople] = useState([]);

	const [results, setResults] = useState([]);
	const [permission, setPermission] = useState("viewer");
	const [status, setStatus] = useState("public");

	useEffect(() => {
		setSearch("");
		setPeople([]);
		setResults([]);
		loadEvent();
	}, [isFocused]);

	useEffect(() => {
		if (search) {
			HTTPClient("/people?getConnectedOnly=false&searchQuery=" + search).then(res => {
				setResults(res.data.people.map(person => {
					return {
						...person,
						status: "result",
					}
				}));
			})
		} else setResults([]);
	}, [search]);

	const loadEvent = () => {
		HTTPClient("/events/" + route.params?.eventId + "/people").then(res => {
			setPeople(res.data.people);
			setPermission(res.data.permission);
			setStatus(res.data.eventStatus);
		})
			.catch(err => {
				console.log(err)
				Alert.alert("Error", "Could not load people", [
					{
						text: "OK",
						onPress: () => navigation.goBack()
					}
				])
			});
	}

	const updatePermission = (personId, permission) => {
		console.log(permission)
		HTTPClient(
			`/events/${eventId}/people/${personId}/permission`,
			"PUT", { permission }
		)
			.then(res => { })
			.catch(err => {
				console.log(err.response.data)
				setPeople(people.map(p => p._id === personId ? {
					...p, permission: permission === "viewer" ? "editor" : "viewer"
				} : p));
				Alert.alert("Error", "Could not change permission", [
					{
						text: "OK",
					}
				])
			});
	}

	const removePeopleAction = () => {

		HTTPClient("/events/" + eventId + "/people", "PUT", {
			add: [],
			remove: selectedIds
		}).then(async res => {
			setSelectionMode(false);
			setAddPeople(addPeople.filter(p => !selectedIds.includes(p._id)));
			setSelectedIds([]);
			loadEvent();
		}).catch(err => {
			console.log(err.response.data);
		});

	}

	const changeEventStatus = () => {
		const newStatus = status === "public" ? "private" : "public";
		HTTPClient("/events/" + eventId, "PUT", {
			status: newStatus
		}).then(async res => {
			setStatus(newStatus);
		}).catch(err => {
			console.log(err);
			Alert.alert("Error", "Could not change event status", [
				{
					text: "OK",
				}
			])
		});
	}

	const addPeopleAction = () => {
		HTTPClient("/events/" + eventId + "/people", "PUT", {
			add: addPeople.map(p => p._id),
			remove: []
		}).then(async res => {
			setSelectionMode(false);
			setSelectedIds([]);
			setAddPeople([]);
			loadEvent();
		}).catch(err => {
			console.log(err);
		});
	}

	return <SafeAreaView style={{
		flex: 1,
		paddingTop: 15,
		backgroundColor: "white",
	}}>
		<View style={{
			flex: 1,
			marginHorizontal: 15
		}}>
			<View style={{ backgroundColor: "white", paddingTop: 10, flex: 1, flexDirection: "row" }}>
				<View style={{ flex: 3 }}>
					<Text style={{
						fontSize: 25,
						fontFamily: "Red Hat Display Bold"
					}}>People</Text>
				</View>
				{addPeople.length !== 0 ? <View style={{ flex: 1 }}>
					<TouchableOpacity onPress={addPeopleAction}>
						<Text style={{
							fontSize: 20,
							fontFamily: "Red Hat Display Semi Bold",
							textAlign: "right"
						}}>Save</Text>
					</TouchableOpacity>

				</View> : null}


			</View>
			<View style={{
				flex: 1,
				flexDirection: "row",
				marginTop: 10,
				backgroundColor: "white"
			}}>

				<View style={{ flex: 3 }}>
					<TouchableOpacity disabled={status !== "public"} style={{
						backgroundColor: status === "public" ? "#2E8EFF" : "rgba(46,142,255,0.45)",
						padding: 2,
						marginRight: 5,
						borderRadius: 50,
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center"
					}}
									  onPress={async () => {
										  await Share.share({
											  url: frontendUrl + "/event/" + route.params.eventId + "/invite",
											  title: "Timestack"
										  });
									  }
									  }
					>
						<FastImage source={require("../assets/icons/collection/link.png")} style={{
							width: 30,
							height: 30,
						}} />
						<Text style={{
							fontSize: 18,
							fontFamily: "Red Hat Display Semi Bold",
							textAlign: "center",
							color: "white"
						}}>
							Share
						</Text>
					</TouchableOpacity>
				</View>
				{permission === "editor" ? <View style={{ flex: 1 }}>
					<TouchableOpacity onPress={changeEventStatus}>
						{status === "public" ? <View style={{
							backgroundColor: "#E41E1E",
							padding: 5,
							borderRadius: 50

						}}>
							<Text style={{
								fontSize: 18,
								fontFamily: "Red Hat Display Semi Bold",
								textAlign: "center",
								color: "white"
							}}>
								Disable
							</Text>
						</View> : <View style={{
							backgroundColor: "white",
							padding: 5,
							borderRadius: 50,
							borderWidth: 1,
							borderColor: "#0CC708"

						}}>
							<Text style={{
								fontSize: 18,
								fontFamily: "Red Hat Display Semi Bold",
								textAlign: "center",
								color: "#0CC708"
							}}>
								Enable
							</Text>
						</View>}
					</TouchableOpacity>
				</View> : null}
			</View>
			<View style={{ marginTop: 10, flex: 1, borderBottomWidth: 1, borderBottomColor: "gray" }}>
				<TextInput
					value={search}
					onChangeText={setSearch}
					style={{
						padding: 5,
						paddingLeft: 10,
						fontSize: 15,
						fontFamily: "Red Hat Display Semi Bold",
						backgroundColor: "#EFEEEE",
						borderRadius: 10
					}}
					placeholder={"Search people"}
				/>
			</View>
			<View style={{ flex: 15 }}>
				<ScrollView style={{ flex: 1 }}>
					{search ? <Text style={{
						paddingTop: 10,
						fontFamily: "Red Hat Display Semi Bold",
					}}>
						People on Timestack
					</Text> : null}
					{!search && permission === "editor" ? <TouchableOpacity
						onPress={() => {
							setSelectionMode(!selectionMode);
							if (selectionMode) {
								setSearch("");
							} else {
								setSelectedIds([]);
							}
						}}
						style={{
							paddingTop: 10
						}}>
						<Text style={{ fontFamily: "Red Hat Display Semi Bold", textAlign: "right" }}>
							{selectionMode ? "Cancel" : "Select"}
						</Text>
					</TouchableOpacity> : null}
					{(search ? results.filter(
						person => !people.find(p => p._id === person._id) && !addPeople.find(p => p._id === person._id)
					) : [...people, ...addPeople.map(u => ({ ...u, status: "result" }))]).map(person => {
						const lightStyle = (person.status === "user" || !addPeople.find(user => user._id === person._id)) && person.status !== "invitee";
						return <TouchableWithoutFeedback onPress={() => {
							if (selectedIds.includes(person._id)) {
								setSelectedIds(selectedIds.filter(id => id !== person._id))
							} else {
								setSelectedIds([...selectedIds, person._id])
							}
						}}>
							<View style={{
								flexDirection: "row",
								marginTop: 10,
								backgroundColor: "white",
							}}>
								<View style={{ marginRight: 10 }}>
									<ProfilePicture
										width={50}
										height={50}
										location={person.profilePictureSource}
										style={{
											borderWidth: selectedIds.includes(person._id) ? 1 : 0,
										}}
									/>
								</View>
								<View style={{ flex: 3, flexDirection: "column" }}>
									<Text style={{
										fontSize: 18,
										fontFamily: "Red Hat Display Semi Bold",
									}}>
										{person?.firstName} {person?.lastName}
									</Text>
									<Text style={{
										fontSize: 15,
										fontFamily: "Red Hat Display Semi Bold",
										color: "gray"
									}}>
										@{person?.username}
									</Text>
								</View>
								<View style={{ flex: 1, marginRight: 10, flexDirection: "row-reverse" }}>
									<View style={{ justifyContent: "center" }}>
										{!selectionMode ? <TouchableOpacity style={{
											// @ts-ignore
											backgroundColor: lightStyle ? "white" : people.status === "result" ? "black" : "#DDDCDD",
											paddingHorizontal: 10,
											paddingVertical: 5,
											marginRight: 0,
											borderRadius: 50,
											borderWidth: lightStyle ? 1 : 0,
											width: 85
										}}

																			onPress={() => {
																				if (permission !== "editor") return;

																				if (person?.status === "result") {
																					if (addPeople.find(user => user._id === person._id)) {
																						setAddPeople(addPeople.filter(user => user._id !== person._id))
																					} else
																					if (!addPeople.find(user => user._id === person._id)) {
																						setAddPeople([...addPeople, person]);
																						setSearch(null);
																					}

																				}
																				else if (person?.status === "user") {
																					let permission = person.permission === "viewer" ? "editor" : "viewer";
																					setPeople(people.map(p => p._id === person._id ? { ...p, permission } : p))
																					updatePermission(person._id, permission);
																				}
																			}}

										>
											<Text style={{
												fontSize: 15,
												fontFamily: "Red Hat Display Semi Bold",
												textAlign: "center",
												color: lightStyle ? "black" : "white"
											}}>
												{person?.status === "user" ? person.permission === "editor" ? "Editor" : "Viewer" : null}
												{person?.status === "invitee" ? "Pending" : null}
												{person?.status === "result" ? addPeople.find(user => user._id === person._id) ? "Selected" : permission === "editor" ? "Add" : "User" : null}
											</Text>
										</TouchableOpacity> : <View style={{ marginLeft: 1 }}>
											{selectedIds.find(id => id === person._id) ?
												<FastImage source={require("../assets/icons/collection/check-filled.png")} style={{ width: 20, height: 20 }} />
												: <FastImage source={require("../assets/icons/collection/check.png")} style={{ width: 20, height: 20 }} />}

										</View>}
									</View>
								</View>
							</View>
						</TouchableWithoutFeedback>
					})}
				</ScrollView>
			</View>
			{selectionMode ? <SafeAreaView style={{ flex: 1, flexDirection: "row", height: "100%", margin: 0 }}>

				<View style={{ flex: 1 }}>
				</View>
				<View style={{ flex: 4, marginTop: 15, alignItems: "center" }}>
					<Text style={{ fontFamily: 'Red Hat Display Semi Bold', marginLeft: -20, fontSize: 18, fontWeight: "600", margin: 0, padding: -30, paddingLeft: 20 }}>
						{selectedIds.length} {selectedIds.length === 1 ? "person" : "people"} selected
					</Text>
				</View>
				<View style={{ flex: 1, alignItems: "center", marginTop: 11, marginRight: 15 }}>
					<TouchableWithoutFeedback style={{ width: "100%" }} onPress={selectedIds.length > 0 ? () => {
						Alert.alert('Remove people', `Do you want to remove ${selectedIds.length} ${selectedIds.length === 1 ? "person" : "people"}.`, [
							{
								text: 'Cancel',
								onPress: () => console.log('Cancel Pressed'),
								style: 'cancel',
							},
							{ text: 'OK', onPress: removePeopleAction },
						])
					} : null
					}>
						<FastImage style={{ borderRadius: 0, width: 30, height: 30 }} source={require("../assets/icons/Remove.png")} />

					</TouchableWithoutFeedback>
				</View>

			</SafeAreaView> : <SafeAreaView style={{ flex: 1 }} />}
		</View>
	</SafeAreaView>

}