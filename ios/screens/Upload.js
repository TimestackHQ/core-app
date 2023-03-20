import {
	View,
	Text,
	StatusBar,
	StyleSheet,
	Image,
	ScrollView,
	TouchableOpacity,
	FlatList,
	TouchableWithoutFeedback, Alert
} from "react-native";
import * as React from "react";
import HTTPClient from "../httpClient";
import {useEffect} from "react";
import * as ImagePicker from "expo-image-picker";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import Video from 'react-native-video';
import UploadViewFlatList from "../Components/UploadViewFlatList";
import FastImage from "react-native-fast-image";

export default function Upload ({payload}) {

	const [importing, setImporting] = React.useState(false);
	const [selecting, setSelecting] = React.useState(false);

	const [event, setEvent] = React.useState(payload.event);
	const [totalMediaCount, setTotalMediaCount] = React.useState(payload.event.mediaCount);
	const [selfMediaCount, setSelfMediaCount] = React.useState(0);
	const [uri, setUri] = React.useState(null);

	const [pendingMedia, setPendingMedia] = React.useState([]);
	const [media, setMedia] = React.useState([]);

	const selectedMedia = React.useRef([]);

	const fetchMedia = () => {
		HTTPClient("/events/"+payload?.eventId+"/media?me=true&limit=9&skip="+media.length).then(res => {
			setMedia([...media, ...res.data.media])
		})
	}

	useEffect(() => {
		setPendingMedia([]);
		HTTPClient("/events/"+payload?.eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
				setTotalMediaCount(response.data.event.mediaCount)
			})
			.catch((error) => {
				console.log(error);
				window.location.href = "/main_ios";
			});

		fetchMedia();


	}, []);

	useEffect(() => {

		const queue = setInterval(async () => {
			setPendingMedia((await ExpoJobQueue.getJobs()).map(job => JSON.parse(job.payload)));
		}, 100);

		const remoteMedia = setInterval(() => {
			HTTPClient("/events/"+payload?.eventId+"/media/byme").then(res => setSelfMediaCount(res.data));
		}, 2000);

		return () => {
			clearInterval(queue);
			clearInterval(remoteMedia);
		}
	}, [event]);

	useEffect(() => {
	}, [pendingMedia]);

	const selectMedia = (_id, state) => {
		setMedia(media.map(m => {
			if(m._id === _id) {
				return {
					...m,
					selected: state
				}
			}
			return m;
	}))}

	const pickImage = async (eventId) => {

		try {

			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsMultipleSelection: true,
				exif: true,
				quality: 0,
			});

			if (!result.canceled) {

				for await (const media of _.uniq(result.assets)) {

					ExpoJobQueue.addJob("mediaQueueV5", {
						...media,
						eventId
					})

				}

				ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

			}

		}catch(err) {
			console.log(err, "err")
		}

		setMedia([]);
		fetchMedia();
		setImporting(false);

	};


	return (
		<View style={styles.container} >


			<View style={{flex: 1, margin: 15, flexDirection: "column"}}>
				<Text style={{ fontFamily: 'Red Hat Display Semi Bold', fontSize: 30, fontWeight: "600", marginLeft: 10 }}>Upload</Text>
				<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', marginTop: 10}}>
					<View style={{flex: 3}}>
						<Image source={{uri: 'data:image/jpeg;base64,' + (payload.event.buffer)}} style={{width: 80, height: 120, borderRadius: 15}} />
					</View>
					<View style={{flex: 80}}>
						<Text style={{ fontFamily: 'Red Hat Display Semi Bold', fontSize: 20, fontWeight: "600", marginLeft: 10 }}>{event?.name ? event?.name : " "}</Text>
					</View>
				</View>
			</View>
			<View style={{flex: 12}}>
				<View style={{
					borderTopColor: "gray",
					borderTopWidth: 1,
					marginLeft: 15,
					marginRight: 15,
					marginBottom: 10,
					flexDirection: 'row',
				}}>
					<Text style={{
						fontFamily: 'Red Hat Display Regular',
						fontSize: 14,
						fontWeight: "300",
						marginTop: 10,

						color: "gray",
						flex: 1
					}}>
						{selfMediaCount} Memories by me
					</Text>
					<TouchableOpacity
						onPress={() =>{
							setSelecting(!selecting);
							if(!selecting) {
								setMedia(media.map(m => {
									return {
										...m,
										selected: false
									}
								}))
							}
						}}
					>
						<Text
							style={{
								fontFamily: 'Red Hat Display Regular',
								fontSize: 15,
								fontWeight: "300",
								marginTop: 10,
								color: "black",
								flex: 1
							}}>
							{selecting ? "Cancel" : "Select"}
						</Text>
					</TouchableOpacity>

				</View>

				<View style={{padding: 0, margin: 0}}>
					{importing || pendingMedia.length !== 0 ? <FlatList
						data={[
							"loader",
							...pendingMedia,
						]}
						numColumns={3}
						renderItem={((raw) => {
							const media = raw.item;
							if(media === "loader") return <View onTouchStart={async () => await pickImage(payload.eventId)} style={styles.item}>
								<Image alt={"Cassis 2022"} style={{borderRadius: 0, width: "100%", height: 180}} source={require("../assets/add-media.png")}/>

							</View>;
							if(media?.type) return <View style={{...styles.item, backgroundColor: "white"}}>
								{media.type === "video" ?
									<Video
										repeat={true}
										source={{uri: media.uri}}
										muted={true}
										resizeMode="cover"
										style={{
											width: "100%",
											height: "100%",
											opacity: 0.5
										}}
									/>
									: <Image  alt={"Cassis 2022"} style={{borderRadius: 0, width: "100%", height: 180, opacity: 0.5}} source={{uri: media.uri}}/>
								}
							</View>
						})}
						keyExtractor={(item, index) => index.toString()}
						onEndReached={() => fetchMedia()}
						onEndReachedThreshold={0.5}

					/> : <View style={{flexDirection: "column", margin: 0, padding: 0}}>

						<UploadViewFlatList
							// style={{flex: 1, height: "90px"}}
							selecting={selecting}
							selectMedia={selectMedia}
							eventId={payload.eventId}
							media={media}
							fetchMedia={fetchMedia}
							pickImage={pickImage}
						/>


					</View>}

					{selecting ? <View style={{flex: 10, flexDirection: "row", height: "100%", margin:0}}>

						<View style={{flex: 1}}>
						</View>
						<View style={{flex: 4, marginTop: 15, alignItems: "center"}}>
							<Text style={{ fontFamily: 'Red Hat Display Semi Bold', marginLeft: -20, fontSize: 18, fontWeight: "600", margin: 0, padding: -30, paddingLeft: 20 }}>
								{media.filter(m => m.selected).length} {media.filter(m => m.selected).length !== 1 ? "Memories" : "Memory"} Selected
							</Text>
						</View>
						<View style={{flex: 1, alignItems: "center", marginTop: 11, marginRight: 15}}>
							<TouchableWithoutFeedback style={{width: "100%"}} onPress={() => {
								const length = media.filter(m => m.selected).length;
								if(length) Alert.alert('Delete memories', `Do you want to delete ${length} memories.`, [
									{
										text: 'Cancel',
										onPress: () => console.log('Cancel Pressed'),
										style: 'cancel',
									},
									{text: 'OK', onPress: () => HTTPClient("/media/"+event._id+"/delete", "POST", {ids: media.filter(m => m.selected).map(m => m._id)}).then(() => {
										setMedia(media.filter(m => !m.selected));
										setSelecting(false);
										setMedia(media.filter(m => !m.selected));
									}).catch(err => {
										alert("Error deleting memories. Please try again.")
									})},
								]);}
							}>
								<Image alt={"Cassis 2022"} style={{borderRadius: 0, width: 30, height: 30, opacity: media.filter(m => m.selected).length ? 1 : 0.5}} source={require("../assets/icons/Remove.png")} />

							</TouchableWithoutFeedback>
						</View>

					</View> : null}



				</View>

			</View>


		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		backgroundColor: '#fff',
		margin: 0
	},
	column: {
		flex: 1,
	},
	gridContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	item: {
		width: '33%', // 30% to account for space between items
		backgroundColor: 'gray',
		height: 180,
		margin: 0.5
	},
});


