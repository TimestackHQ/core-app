import _ from "lodash";
import {
	Image,
	TouchableOpacity,
	View,
	Text,
	Alert,
	ActivityIndicator,
	Dimensions,
	FlatList,
	TouchableWithoutFeedback, StyleSheet, Button, SafeAreaView
} from "react-native";
import { useEffect, useState } from "react";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import { getTimezone } from "../utils/time";
import FastImage from "react-native-fast-image";
import ProfilePicture from "../Components/ProfilePicture";
import { HeaderButtons, HiddenItem, OverflowMenu } from "react-navigation-header-buttons";
import * as React from "react";
import {LinkContentScreenNavigationProp, RootStackParamList} from "../navigation";
import { BlurView } from "@react-native-community/blur";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import InnerMediaHolder from "../Components/InnerMediaHolder";
import { MediaInView } from "@api-types/public";
import { flatten } from "lodash";
import { MediaInternetType } from "@shared-types/*";
// import {ReactNativeModal} from "react-native-modal";
import ReactNativeModal from 'react-native-swipe-modal-up-down';
import MediaViewHeaders from "../Components/MediaView/MediaViewHeaders";
import MediaViewNavBar from "../Components/MediaView/MediaViewNavBar";

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

	const deleteMedia = (id) => {
		HTTPClient(`/media/${route.params.holderId}/delete${route.params.holderType === "socialProfile" ? "?profile=true" : ""}`, "POST", { ids: [id] }).then(() => {
			if (gallery.length === 1 || currentIndex === gallery.length - 1) {
				navigator.goBack();
				return;
			}
			setGallery(gallery.filter((item) => item._id !== id));
		}).catch(err => {
			console.log(err.response);
			alert("Error deleting. Please try again.")
		})
	}

	const handleSwipe = (direction) => {
		if (direction === 'left') {
			setCurrentIndex((prevIndex) => prevIndex + 1);
		} else if (direction === 'right') {
			setCurrentIndex((prevIndex) => prevIndex - 1);
		}
	};

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
					headerBackTitle: "Back",
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

	}, [currentIndex, gallery]);


	const onViewCallBack = React.useCallback((event) => {
		setItemInView(event.viewableItems[0]?.item?._id);
		console.log("Item in view", event.viewableItems[0]?.item?._id);
	}, []) // any dependencies that require the function to be "redeclared"

	const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 })

	return (
		<View style={{ backgroundColor: "white", flex: 1, flexDirection: "column" }}>
			<View style={{ flex: 9 }}>
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
		// backgroundColor: '#111',
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

const stylesModal = StyleSheet.create({
	containerContent: {flex: 1, marginTop: 400, paddingTop: 400},
	containerHeader: {
		marginTop: 400,
		flex: 1,
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		backgroundColor: '#F1F1F1',
	},
	headerContent:{
		marginTop: "70%",
	},
	Modal: {
		marginTop: "70%",
		backgroundColor: '#005252',
	}
});



