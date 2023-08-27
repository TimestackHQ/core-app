import {
	TouchableOpacity,
	View,
	Text,
	Platform,
	Alert, PermissionsAndroid, Image,
} from "react-native";
import { useEffect, useState } from "react";
import * as React from "react";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import * as _ from "lodash";
import moment from "moment";
import { v4 } from "uuid";
import * as Network from "expo-network";
import { NetworkStateType } from "expo-network";
import * as TimestackCoreModule from "../modules/timestack-core";
import AndroidRoll from "../Components/AndroidRoll";
import { useAppDispatch } from "../store/hooks";
import { setRoll } from "../store/rollState";
import { RootStackParamList } from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import { PhotoIdentifier } from "@react-native-camera-roll/camera-roll";
import FastImage from "react-native-fast-image";
import { BlurView } from "@react-native-community/blur";
import { v4 as uuid } from "uuid";
import {uploadQueueWorker} from "../hooks/queue";

const groupPanelHeight = 65;

export default function Roll() {

	const navigator = useNavigation();
	const route = useRoute<RouteProp<RootStackParamList, "Roll">>()

	const [selected, setSelected] = useState<{
		[key: string]: (PhotoIdentifier["node"] & { group: string | null })
	}>({});

	const [selectionCounter, setSelectionCounter] = useState(0);
	const [groups, setGroups] = useState<{
		[key: string]: {
			media: string[]
		}
	}>({
		[uuid()]: {
			media: []
		}
	});
	const [isGrouping, setIsGrouping] = useState(false);

	const dispatch = useAppDispatch();

	const isFocused = useIsFocused();

	async function hasAndroidPermission() {

		const checkPermission = async (permission) => {
			const hasPermission = await PermissionsAndroid.check(permission);
			if (hasPermission) {
				return true;
			}

			const status = await PermissionsAndroid.request(permission);
			return status === 'granted';
		}

		if (Number(Platform.Version) >= 33) {
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
			await checkPermission(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
		}
		await checkPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
	}

	useEffect(() => {
		console.log("Hey", route.params);
		if (isFocused) {
			dispatch(setRoll({
				...route.params
			}));
			setTimeout(() => {
				dispatch(setRoll({
					...route.params
				}))
			}, 1000);
		}
	}, [isFocused]);

	const save = async () => {

		const mediaSelected = [];

		Object.values(selected).forEach((item) => mediaSelected.push(item));

		console.log(mediaSelected);

		const upload = async () => {
			if (route.params.holderType !== "none") {
				for await (const media of mediaSelected) {

					// const groupName = Object.keys(groups).find((group) => groups[group].media.includes(media.image.uri));

					console.log("payload:", {
						uri: media.image.uri,
						type: media.type,
						holderId: route.params.holderId,
						groupName: media.group ? media.group : null,
					})
					uploadQueueWorker.addJob({
						id: v4(),
						item: {
							filename: moment().unix() + "_" + v4() + "." + media.image.extension,
							extension: media.image.extension,
							uri: media.image.uri,
							type: media.type,
							holderId: route.params.holderId,
							holderType: route.params.holderType,
							playableDuration: media.image.playableDuration,
							timestamp: media.timestamp,
							location: media.location,
							filesize: media.image.filesize,
							groupName: media.group ? media.group : null,
							compressionProgress: 0,
						},
						holderId: route.params.holderId,
						status: "pending",
					})

				}

				navigator.goBack();

			} else {
				Alert.alert("Error", "You must select a holder to upload to.");
			}
		}
		const net = await Network.getNetworkStateAsync();
		if (net.type === NetworkStateType.CELLULAR) {
			Alert.alert("Cellular Upload", `Do you want to upload ${mediaSelected.length} items over cellular?`, [
				{
					text: "Cancel",
					onPress: () => navigator.goBack(),
				}, {
					text: "OK",
					onPress: upload

				}]);

		} else {
			await upload();
		}

	}

	useEffect(() => {
		if (Platform.OS === 'android') hasAndroidPermission();
	}, []);

	useEffect(() => {
		console.log("=>>>>GROUPS", JSON.stringify(groups, null, 2))
	}, [groups])

	const onMediaPicked = async (event) => {

		const selectedList = selected;
		const item: PhotoIdentifier["node"] = Platform.OS === "ios" ? event.nativeEvent.itemDetails : event.reactEvent;

		const id = item.image.uri;


		if (selectedList?.[id]) {
			setSelectionCounter(selectionCounter - 1);
			if (selectedList[id]?.group && selectedList[id].group !== "") {
				console.log(selectedList[id].group);
				setGroups({
					...groups,
					[selectedList[id].group]: {
						// media: [],
						media: groups[selectedList[id].group].media.filter((media) => {
							console.log(media, id);
							return media !== id
						})
					}
				})

			}
			delete selectedList[id]

		} else {
			const groupsArray = Object.keys(groups);
			const group = groupsArray.pop();

			selectedList[id] = {
				...item,
				group: isGrouping ? group : null
			}
			setSelectionCounter(selectionCounter + 1);
			if (isGrouping) {
				const groupContent = groups[group].media;
				groupContent.push(id);
				setGroups({
					...groups,
					[group]: {
						media: groupContent
					}
				});
			}
		}



		setSelected(selectedList);


	}

	const grouping = () => {
		if (isGrouping) {
			setGroups({
				...groups,
				[uuid()]: {
					media: []
				}
			})
		}
		setIsGrouping(!isGrouping);
	}

	return <View style={{ flex: 1, flexDirection: "column" }}>
		{route.params.holderType === "socialProfile" && (
			<View style={{ flex: 2, justifyContent: 'center', padding: 15, paddingBottom: 0, backgroundColor: "#FFFEFD" }}>
				{route.params.profile.people.length === 1 && (
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<ProfilePicture width={50} height={50} location={route.params.profile.people[0].profilePictureSource} />
						<View style={{ flex: 1, alignItems: "flex-start", flexDirection: "column", margin: 10 }}>
							<Text style={{ fontSize: 20, marginBottom: 0, fontFamily: "Red Hat Display Bold" }}>
								{route.params.profile.people[0].firstName} {route.params.profile.people[0].lastName}
							</Text>
							<Text style={{ fontSize: 16, marginTop: -5, fontFamily: "Red Hat Display Regular" }}>
								{route.params.profile.people[0].username}
							</Text>
						</View>
					</View>
				)}
			</View>
		)}

		<View style={{
			backgroundColor: "#FFFEFD", flexDirection: "row", flex: 2, justifyContent: 'space-between', borderBottomWidth: 1,
			borderBottomColor: "#3C3C435C"
		}}>
			<View style={{ justifyContent: "flex-end", flexGrow: 1, flexDirection: "column" }}>
				<Text style={{
					fontSize: 32,
					fontFamily: "Red Hat Display Bold",
					paddingVertical: 5,
					padding: 14,
					paddingBottom: 10,
					textAlign: "left",
					textAlignVertical: "center"
				}}>Recents</Text>
			</View>
			<View style={{ justifyContent: "center" }}>
				<TouchableOpacity>
					<Text style={{
						fontSize: 16,
						fontFamily: "Red Hat Display Semi Bold",
						paddingTop: 20,
						padding: 15,
						color: "#A6A6A6",
						textAlign: "right"
					}}>Clear</Text>
				</TouchableOpacity>
			</View>
		</View>

		<View style={{ flex: 20, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
			<View style={{
				flex: 2,
				zIndex: 2,
				// flexDirection: "column",
				// alignItems: 'center',
				position: "absolute",
				width: "100%",
				paddingHorizontal: "5%",
				bottom: 50
			}}>
				<View style={{ flex: 1, width: "100%" }}>
					<TouchableOpacity onPress={grouping} style={{
						alignSelf: "flex-end",
						width: 120,
						height: 32,
						// marginHorizontal: 200,
						backgroundColor: "white",
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: 25,
						marginVertical: 10,
						padding: 10,
						shadowColor: 'black',
						shadowOffset: {
							width: 0,
							height: 0
						},
						shadowOpacity: 1,
						shadowRadius: 10,
						elevation: 5
					}}>
						<View style={{ flexDirection: "row" }}>

							{isGrouping ? <Text style={{ paddingBottom: "18%", fontSize: 14, fontFamily: "Red Hat Display Regular", zIndex: 3, color: "black" }}>
								Done
							</Text> : <React.Fragment>
								<FastImage
									source={require("../assets/icons/collection/new-group.png")}
									style={{ width: 18, height: 18, zIndex: 3, marginRight: 5 }}
								/>
								<Text style={{ fontSize: 14, fontFamily: "Red Hat Display Regular", zIndex: 3, color: "black" }}>
									New group
								</Text>
							</React.Fragment>}
						</View>
					</TouchableOpacity>
				</View>
				{selectionCounter !== 0 && (
					<TouchableOpacity style={{
						flex: 2,
						zIndex: 3,
						width: "100%",
						height: 50,
						backgroundColor: "white",
						justifyContent: 'center',
						alignItems: 'center',
						borderRadius: 25,
						shadowColor: 'white',
						shadowOffset: {
							width: 0,
							height: 0
						},
						shadowOpacity: 1,
						shadowRadius: 1,
						elevation: 1000
					}} onPress={save}>
						<Text style={{ fontSize: 20, fontFamily: "Red Hat Display Semi Bold", zIndex: 3, color: "black" }}>
							Add {selectionCounter} {selectionCounter !== 1 ? "memories" : "memory"}
						</Text>
					</TouchableOpacity>
				)}
			</View>

			<View style={{ zIndex: 1, flex: 1 }}>
				{groups[Object.keys(groups)[0]].media.length !== 0 ? (
					<BlurView
						style={{
							position: "absolute",
							top: 0,
							width: "100%",
							flex: 1,
							height: groupPanelHeight,
							paddingBottom: 10,
							zIndex: 2,

						}}
						blurType="xlight"
						blurAmount={5}
						reducedTransparencyFallbackColor="white"
					>
						<View style={{
							flexDirection: "row",
							alignContent: "center",
							alignItems: "center",
						}}>

							{[...Object.keys(groups)].map((key, index) => {
								const group = groups[key];
								const image0 = selected[group.media[0]];
								const image1 = selected[group.media[1]];
								console.log(image0);
								return image0 ? (
									<View key={index} style={{
										flexDirection: "row",
										width: 30,
										alignContent: "center",
										alignItems: "center",
										justifyContent: "center",
										height: groupPanelHeight,
										marginLeft: 15,
										marginRight: 10
									}}>
										<Image source={{ uri: image0.image.uri }} style={{
											width: "100%", height: 40, borderRadius: 5, borderColor: "white",
											borderWidth: 1, zIndex: 2, position: "absolute"
										}} />
										{image1 ? <Image source={{ uri: image1.image.uri }} style={{
											width: "100%", height: 40, borderRadius: 5, borderColor: "white",
											borderWidth: 1, zIndex: 1, position: "absolute", top: 16, right: 4
										}} /> : null}
										<View style={{
											borderRadius: 60, borderColor: "white", zIndex: 3,
											padding: 0,
											paddingHorizontal: 5,
											position: "absolute", top: 8, right: -6, backgroundColor: "white"
										}}>
											<Text style={{
												fontSize: 12,
												fontFamily: "Red Hat Display Semi Bold",
											}}>
												{group.media.length}
											</Text>
										</View>
									</View>
								) : null;
							})}

						</View>
					</BlurView>
				) : null}
				{Platform.OS === 'ios' ? (
					<TimestackCoreModule.TimestackCoreView selectedPhotos={isGrouping ? Object.keys(selected).filter(key => !groups[Object.keys(groups)[Object.keys(groups).length - 1]].media.includes(key)) : []} onMediaPicked={onMediaPicked} style={{ flex: 11 }} />
				) : (
					<AndroidRoll onMediaPicked={onMediaPicked} />
				)}
			</View>
		</View>
	</View>

}


