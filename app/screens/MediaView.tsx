import _ from "lodash";
import {
	View,
	Text,
	Alert,
	Dimensions,
	FlatList,
	StyleSheet, TouchableWithoutFeedback
} from "react-native";
import { useEffect, useState } from "react";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import { getTimezone } from "../utils/time";
import * as React from "react";
import {LinkContentScreenNavigationProp, RootStackParamList} from "../navigation";
import { BlurView } from "@react-native-community/blur";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import InnerMediaHolder from "../Components/InnerMediaHolder";
import { MediaInView } from "@api-types/public";
import { flatten } from "lodash";
import { MediaInternetType } from "@shared-types/*";
import MediaViewHeaders from "../Components/MediaView/MediaViewHeaders";
import MediaViewNavBar from "../Components/MediaView/MediaViewNavBar";
import TextComponent from "../Components/Library/Text";
import ProfilePicture from "../Components/ProfilePicture";

// optional
const options = {
	enableVibrateFallback: true,
	ignoreAndroidSystemSettings: false,
};


const { width } = Dimensions.get('window');




export default function MediaView() {

	const navigator = useNavigation<LinkContentScreenNavigationProp>();
	const route = useRoute<RouteProp<RootStackParamList, "MediaView">>();
	const isFocused = useIsFocused();

	const [gallery, setGallery] = useState(route.params?.content);
	const [media, setMedia] = useState<MediaInView>(null);
	const [hasPermission, setHasPermission] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(null);
	const [isInGroup, setIsInGroup] = useState(0);
	const [itemInView, setItemInView] = useState(null);
	let [ShowComment, setShowModelComment] = useState(false);
	let [animateModal, setanimateModal] = useState(false);


	const getGallery = () => {
		HTTPClient(`/social-profiles/${route.params.holderId}/media?skip=${gallery.length}${route.params.holderType === "socialProfile" ? "&profile=true" : ""}`, "GET")
			.then(res => {
				const newGallery: MediaInternetType[] = res.data.content;
				setGallery(_.uniq([...gallery, ...flatten(newGallery)]));
			});
	}

	const deleteMedia = (mediaId, mediaContentId) => {

		console.log({mediaId: mediaId,
			contentId: mediaContentId,
			holderId: route.params.holderId,
			holderType: route.params.holderType
		})


		HTTPClient(`/media/delete`, "POST", {
			mediaId: mediaId,
			contentId: mediaContentId,
			holderId: route.params.holderId,
			holderType: route.params.holderType
		}).then(() => {
			if (gallery.length === 1 || currentIndex === gallery.length - 1) {
				navigator.goBack();
				return;
			}
			setGallery(gallery.filter((item) => item._id !== mediaId));
		}).catch(err => {
			console.log(err.response);
			alert("Error deleting. Please try again.")
		})
	}

	useEffect(() => {

		if (isFocused) {
			setHasPermission(Boolean(route.params?.hasPermission));
			setGallery(route.params?.content);
			setCurrentIndex(route.params?.currentIndex)
		}

	}, [isFocused]);

	useEffect(() => {
		const current = gallery[currentIndex];
		const id = current?._id;
		if (!id) return;

		const url = `/media/view/${id}/${route.params?.holderId}${route.params.holderType === "socialProfile" ? "?profile=true" : ""}`;
		console.log("Fetching media", url)
		HTTPClient(url, "GET")
			.then(async res => {
				console.log(res.data)
				const timezone = getTimezone();

				setMedia(res.data.media);

				if (isInGroup == 1 && current?.isGroup) {
					ReactNativeHapticFeedback.trigger("impactHeavy", options);
					setIsInGroup(2);
				} else if (isInGroup == 2 && !current?.isGroup) {
					ReactNativeHapticFeedback.trigger("impactHeavy", options);
					setIsInGroup(1);
				} else {
					if (current?.isGroup) setIsInGroup(2);
					else setIsInGroup(1);
				}

				navigator.setOptions({
					headerBackTitleStyle: {
						color: "black"
					},
					headerBackTitle: "",
					headerBackTitleVisible: true,
					headerShown: true,
					headerTitle: () => res.data.media?.timestamp ? (
						<View>
							<Text style={{
								fontSize: 15, textAlign: "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("MMMM D, YYYY")}
							</Text>
							<Text style={{
								fontSize: 10, textAlign: "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("h:mm A")}
							</Text>
						</View>
					) : <View>
						<Text style={{
							fontSize: 15, textAlign: "center", fontFamily: "Red Hat Display Semi Bold"
						}}>
						</Text>
					</View>,

					headerRight: () => <MediaViewHeaders media={res.data.media} deleteMedia={deleteMedia} hasPermission={res.data.media?.hasPermission} />

				});
			})
			.catch(err => {
				console.log(err);
				Alert.alert("Error", "Unable to load media", [
					{
						text: "OK",
						onPress: () => {
							navigator.goBack();
						}
					}
				])
			});

	}, [currentIndex, gallery, isFocused]);


	const onViewCallBack = React.useCallback((event) => {
		setItemInView(event.viewableItems[0]?.item?._id);
		console.log("Item in view", event.viewableItems[0]?.item?._id);
	}, [])

	const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 })

	return (
		<View style={{ backgroundColor: "white", flex: 1, flexDirection: "column" }}>
			<View style={{ flex: media?.people.length > 1 ? 18 : 19 }}>
				<View style={styles.container}>
					{gallery[currentIndex]?.isGroup ? <BlurView
						style={{
							position: "absolute",
							top: 0,
							flex: 1,
							margin: 10,
							// height: groupPanelHeight,
							padding: 0,
							zIndex: 2,
							height: 20,
							paddingHorizontal: 10,
							minWidth: 40,
							borderRadius: 10,
							alignContent: "center",
							justifyContent: "center",
							alignItems: "center",

						}}
						blurType="dark"
						blurAmount={5}
						reducedTransparencyFallbackColor="white"
					>
						<Text style={{
							fontSize: 12,
							color: "white",
							fontFamily: "Red Hat Display Regular",
							textAlign: "center",

						}}>
							{gallery[currentIndex]?.indexInGroup + 1} / {gallery[currentIndex]?.groupLength}
						</Text>
					</BlurView> : null}
					<FlatList
						data={gallery}
						horizontal
						viewabilityConfig={viewConfigRef.current}
						onViewableItemsChanged={onViewCallBack}
						showsHorizontalScrollIndicator={false}
						pagingEnabled
						initialScrollIndex={currentIndex}
						getItemLayout={(data, index) => (
							{ length: width, offset: width * index, index }
						)}
						keyExtractor={(item) => item._id}
						renderItem={({ item, index }) => {
							console.log("itemId", item._id)
							return (
								<InnerMediaHolder
									selfIndex={index}
									currentIndex={currentIndex}
									item={item}
									holderId={route.params?.holderId}
									holderType={route.params?.holderType}
								/>
							)
						}}
						onScroll={(event) => {
							const { contentOffset } = event.nativeEvent;
							const index = Math.round(contentOffset.x / width);
							setCurrentIndex(index);
						}}
						onEndReached={() => getGallery()}
						onEndReachedThreshold={3}

					/>
				</View>
			</View>
			{media?.people.length > 1 ? <View style={{
				flex: 1,
				flexDirection: "row",
			}}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					flex: 1,
					marginLeft: 10, marginVertical: 15, marginTop: 10,
					marginRight: 15

				}}>

					{media?.people.length > 1 ? media?.people.map((user, i) => {
						if (media.people.length > 7 && i === 7) {
							return (
								<TouchableWithoutFeedback style={{ marginLeft: 5 }}>
									<View>
										<View style={{
											width: 20,
											height: 20,
											borderRadius: 30,
											justifyContent: 'center',
											alignItems: 'center',
											marginLeft: 5,
											backgroundColor: "black",
											opacity: 0.6,
											zIndex: 1,
											position: "absolute",
											right: 0,
											bottom: 0,
										}}>
											<TextComponent
												fontSize={10}
												fontFamily={"Semi Bold"}
												style={{
													color: "white",
												}}
											>{12 - 6}</TextComponent>
										</View>
										<ProfilePicture
											pressToProfile={false}
											key={i}
											userId={user?._id.toString()}
											width={20}
											height={20}
											location={user.profilePictureSource}
											style={{ marginLeft: 5 }}
										/>
									</View>
								</TouchableWithoutFeedback>
							);
						} else if(i < 7) {
							return (
								<ProfilePicture
									key={i}
									userId={user._id.toString()}
									style={{ marginLeft: 5, borderColor: "black", borderWidth: 1 }}
									width={20}
									height={20}
									location={user.profilePictureSource}
									pressToProfile={false}
								/>

							);
						} else {
							return null;
						}

					}) : null}

				</View>
			</View> : null}
			<MediaViewNavBar
				media={media}
				holderId={route.params?.holderId}
				holderType={route.params?.holderType}
			/>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
	},
	dotsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		bottom: 20,
		width,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginHorizontal: 6,
	},
};
