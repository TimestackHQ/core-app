import * as FileSystem from "expo-file-system";
import ImageZoom from 'react-native-image-pan-zoom';
import {
	Image,
	TouchableOpacity,
	View,
	Text,
	Alert,
	ActivityIndicator,
	Dimensions,
	FlatList,
	TouchableWithoutFeedback
} from "react-native";
import {useEffect, useState} from "react";
import Share from "react-native-share";
import {useNavigation, useRoute} from "@react-navigation/native";
import HTTPClient from "../httpClient";
import moment from "moment-timezone";
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import {getTimezone} from "../utils/time";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";
import ProfilePicture from "../Components/ProfilePicture";
import * as MediaLibrary from "expo-media-library";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import * as React from "react";

const { width } = Dimensions.get('window');


function Headers ({media, hasPermission, deleteMedia}) {

	const [sharing, setSharing] = useState(false);
	return <HeaderButtons>
		<View>
			<ActivityIndicator color={"#4fc711"} animating={sharing} style={{marginTop: 5}} />
		</View>
		<TouchableOpacity onPress={async () => {
			setSharing(true);
			try {

				await FileSystem.downloadAsync(media?.storageLocation, FileSystem.documentDirectory + media?.fileName);
				setSharing(false);
				await Share.open({
					url: FileSystem.documentDirectory + media?.fileName,
				});
				return;
			} catch(e) {
				console.log(e)
				// if(e !== "[Error: User did not share]") Alert.alert("Error", "Unable to share media");
			}
			setSharing(false);
		}}>

			<Image source={require("../assets/icons/collection/share.png")} style={{width: 30, height: 30}} />
		</TouchableOpacity>
		{hasPermission ? <OverflowMenu
			style={{ marginHorizontal: 10, marginRight: -10 }}
			OverflowIcon={({ color }) =><View color="#000" style={{color: "black"}} onPress={() => {
			}} title="Update count">
				<TouchableOpacity>
					<Image source={require("../assets/icons/collection/three-dots.png")} style={{width: 35, height: 35}} />
				</TouchableOpacity>
			</View>}
		>
			 <HiddenItem style={{color: "red"}} title="Delete" onPress={() => {
				 Alert.alert("Delete", "Are you sure you want to delete this item?", [
					 {
						 text: "Cancel",
						 onPress: () => console.log("Cancel Pressed"),
						 style: "cancel"
					 },
					 { text: "Yes", onPress: () => deleteMedia(media?._id) }

                 ]);
			 }}/>
		</OverflowMenu> : null}
	</HeaderButtons>
}

export default function MediaView() {

	const navigator = useNavigation();
	const route = useRoute();

	const imageUrl = "https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=2726&h=2047&dpr=1";
	const [content, setContent] = useState(route.params?.content);
	const [media, setMedia] = useState(null);
	const [hasPermission, setHasPermission] = useState(false);

	const [downloading, setDownloading] = useState(false);
	const [sharing, setSharing] = useState(false);

	const [currentIndex, setCurrentIndex] = useState(0);

	const [swipeDirection, setSwipeDirection] = useState('');


	const getGallery = () => {
		HTTPClient(`/events/${route.params.eventId}/media?skip=${content.length}`, "GET")
			.then(res => {
				setContent([...content, ...res.data.media]);

			});
	}

	const deleteMedia = (id) => {
		HTTPClient("/media/"+route.params.eventId+"/delete", "POST", {ids: [id]}).then(() => {
			if(content.length === 1 || currentIndex === content.length - 1) {
				navigator.goBack();
				return;
			}
			setContent(content.filter((item) => item._id !== id));
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

	const mediaFetch = id => {
		setContent(route.params?.content);
		setCurrentIndex(route.params?.currentIndex)
	}

	useEffect(() => {

		setHasPermission(Boolean(route.params?.hasPermission));
		mediaFetch(route.params?.mediaId);

		console.log("MediaView: ", route.params);


	}, []);

	useEffect(() => {
		const id = content[currentIndex]?._id;
		HTTPClient(`/media/view/${id}/${route.params?.eventId}`, "GET")
			.then(async res => {
				const timezone = getTimezone();

				setMedia(res.data.media);

				navigator.setOptions({
					headerBackTitle: "Back",
					headerBackButtonVisible: true,
					headerShown: true,
					headerTitle: () => res.data.media?.timestamp ? (
						<View>
							<Text style={{
								fontSize: 15, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("MMMM D, YYYY")}
							</Text>
							<Text style={{
								fontSize: 10, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
							}}>
								{moment.tz(res.data.media.timestamp, String(timezone)).format("h:mm A")}
							</Text>
						</View>
					) : <View>
						<Text style={{
							fontSize: 15, textAlign : "center", fontFamily: "Red Hat Display Semi Bold"
						}}>
						</Text>
					</View>,

					headerRight: () => <Headers media={res.data.media} deleteMedia={deleteMedia} hasPermission={route.params?.hasPermission}/>

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

	}, [currentIndex, content]);

	return (
		<View style={{backgroundColor: "white", flex: 1, flexDirection: "column"}}>
			<View style={{flex: 9}}>
				<View style={styles.container}>
					<FlatList
						data={content}
						horizontal
						showsHorizontalScrollIndicator={false}
						pagingEnabled
						initialScrollIndex={currentIndex}
						getItemLayout={(data, index) => (
							{length: width, offset: width * index, index}
						)}
						// keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<TouchableWithoutFeedback onPress={() => handleSwipe('left')}>
								<Image
									source={{ uri: item?.thumbnail }}
									style={{ width, height: "100%", resizeMode: "contain" }}
								/>
							</TouchableWithoutFeedback>
						)}
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
			<View style={{flex: 1, padding: 10, alignContent: "center", flexDirection: "row", backgroundColor: "white"}}>
				<View>
					<ProfilePicture location={media?.user?.profilePictureSource} width={35} height={35}/>
				</View>
				<View style={{flexDirection: "row", justifyContent: "space-between"}}>
					<View style={{flexDirection: "column", justifyContent: "center"}}>
						<Text style={{fontFamily: "Red Hat Display Semi Bold", fontSize: 17, marginBottom: 40, marginLeft: 10}}>
							{media?.user?.firstName} {media?.user?.lastName}
						</Text>

					</View>
				</View>
				<ActivityIndicator animating={downloading} style={{position: 'absolute', right: 40, marginTop: 5}} color={"#4fc711"} />
				<TouchableOpacity onPress={async () => {
					setDownloading(true);
					try {
						const location = await FileSystem.downloadAsync(media?.storageLocation, FileSystem.documentDirectory + media?.fileName);
						await MediaLibrary.saveToLibraryAsync(FileSystem.documentDirectory + media?.fileName)
						Alert.alert("Saved", "");
					} catch (err) {
						Alert.alert("Failed to save", "");
					}
					setDownloading(false)
				}
				} disabled={downloading} style={{position: 'absolute', right: 10, marginTop: 15, marginRight: 5}} >
					<FastImage
						source={require("../assets/icons/download.png")}
						style={{width: 20, height: 20, marginLeft: 10}}
					/>
				</TouchableOpacity>
			</View>
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


