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
import {launchImageLibrary} from "react-native-image-picker";
import {useFocusEffect, useNavigation, useRoute,} from "@react-navigation/native";

export default function Upload ({}) {

	const navigation = useNavigation();

	const route = useRoute();

	const [selecting, setSelecting] = React.useState(false);

	const [event, setEvent] = React.useState(route?.params.event);
	const [totalMediaCount, setTotalMediaCount] = React.useState(route?.params.event?.mediaCount);
	const [selfMediaCount, setSelfMediaCount] = React.useState(0);
	const [uri, setUri] = React.useState(null);

	const [pendingMedia, setPendingMedia] = React.useState([]);
	const [jobsLength, setJobsLength] = React.useState(0);
	const [media, setMedia] = React.useState([]);

	const selectedMedia = React.useRef([]);

	const fetchMedia = (flush) => {
		HTTPClient("/events/"+route?.params?.eventId+"/media?me=true&limit=9&skip="+String(flush ? 0 : media.length)).then(res => {
			if(flush){
				setMedia(res.data.media)
			}else {
				setMedia([...media, ...res.data.media])
			}
		})
			.catch((error) => {
				console.log(error);
				// window.location.href = "/main_ios";
			});
	}

	useEffect(() => {
		setPendingMedia([]);
		HTTPClient("/events/"+route?.params?.eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
				setTotalMediaCount(response.data.event.mediaCount)
			})
			.catch((error) => {
				console.log(error);
				// window.location.href = "/main_ios";
			});

		fetchMedia();

		const queue = async () => {
			const jobs = (await ExpoJobQueue.getJobs())
				.map(job => JSON.parse(job.payload))
				.filter(job => job.eventId.toString() === route?.params?.eventId.toString())
				.reverse();

			const pendingQueue = [
				...pendingMedia
					.map(pending => {
						return {
							...pending,
							processed: true
						}
					}),
				...jobs.map(job => {
					// if (!pendingMedia.map(pending => pending.uri).includes(job.uri)) {
						return {
							...job,
							processed: false
						}
					// }
				})
			]


			setPendingMedia(pendingQueue);

			queue();
		}

		queue();

	}, []);

	useEffect(() => {
		const remoteMedia = setInterval(() => {
			HTTPClient("/events/"+route?.params?.eventId+"/media/byme").then(res => setSelfMediaCount(res.data));
		}, 2000);

		return () => {
			clearInterval(remoteMedia);
		}
	}, [event]);

	useEffect(() => {
		if(pendingMedia.length === 0){
			setTimeout(() => {
				fetchMedia(true);
			}, 1000);
		};
	}, [pendingMedia.length])

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

		navigation.navigate("Roll", {
			eventId
		});

	};



	return (
		<View style={styles.container} >

			<View style={{flex: 1, margin: 15, flexDirection: "column"}}>
				<Text style={{ fontFamily: 'Red Hat Display Semi Bold', fontSize: 30, fontWeight: "600", marginLeft: 10 }}>Upload</Text>
				<View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', marginTop: 10}}>
					<View style={{flex: 3}}>
						<Image
							source={{uri: 'data:image/jpeg;base64,' + (route?.params?.placeholder)}}
							style={{
								width: 100,
								height: 140,
								borderRadius: 15,
								borderStyle: "solid",
								borderColor: "black"
						}} />
					</View>
					<View style={{flex: 7}}>
						<Text style={{ fontFamily: 'Red Hat Display Semi Bold', fontSize: 20, fontWeight: "600", marginLeft: 10 }}>{event?.name ? event?.name : " "}</Text>
					</View>
				</View>
			</View>
			<View style={{flex:3}}>
				<View style={{
					borderTopColor: "gray",
					borderTopWidth: 1,
					marginLeft: 15,
					marginRight: 15,
					marginBottom: 10,
					flexDirection: 'row',
				}}>
					{pendingMedia.length === 0 ? <Text style={{
						fontFamily: 'Red Hat Display Regular',
						fontSize: 14,
						fontWeight: "300",
						marginTop: 10,

						color: "gray",
						flex: 1
					}}>
						{selfMediaCount} Memories by me
					</Text> : <Text style={{
						fontFamily: 'Red Hat Display Regular',
						fontSize: 14,
						fontWeight: "300",
						marginTop: 10,

						color: "green",
						flex: 1
					}}>
						{pendingMedia.length} Remaining ({Number(pendingMedia.reduce((acc, cur) => acc + cur.fileSize, 0) / (1024 * 1024)).toFixed(2)} MB)
					</Text>}
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
						{pendingMedia.length === 0 ? <Text
							style={{
								fontFamily: 'Red Hat Display Regular',
								fontSize: 15,
								fontWeight: "300",
								marginTop: 10,
								color: "black",
								flex: 1
							}}>
							{selecting ? "Cancel" : "Select"}
						</Text> : <TouchableOpacity style={{
								flex: 1
							}}
                            onPress={() => {
								Alert.alert(
									"Cancel Upload",
									"Are you sure you want to cancel the upload?",
									[
										{
											text: "Cancel",
											onPress: () => console.log("Cancel Pressed"),
											style: "cancel"
										},
										{ text: "OK", onPress: async () => {
											await ExpoJobQueue.removeAllJobsForWorker("mediaQueueV25");
											setPendingMedia([]);
										}}
									]
								);

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
								{"Cancel upload"}
							</Text>
						</TouchableOpacity>}
					</TouchableOpacity>

				</View>

				<View style={{padding: 0, margin: 0}}>
					<View style={{flexDirection: "column", margin: 0, padding: 0}}>

						<UploadViewFlatList

							// style={{flex: 1, height: "90px"}}
							selecting={selecting}
							selectMedia={selectMedia}
							eventId={route?.params.eventId}
							media={media}
							pendingMedia={pendingMedia.map(m => {
								return {
									...m,
									pending: true
								}
							})}
							fetchMedia={fetchMedia}
							pickImage={pickImage}
						/>


					</View>

					{selecting ? <View style={{flex: 10, flexDirection: "row", height: "100%", margin:0}}>

						<View style={{flex: 1}}>
						</View>
						<View style={{flex: 4, marginTop: 15, alignItems: "center"}}>
							<Text style={{ fontFamily: 'Red Hat Display Semi Bold', marginLeft: -20, fontSize: 18, fontWeight: "600", margin: 0, padding: -30, paddingLeft: 20 }}>
								{media.filter(m => m.selected).length} {media.filter(m => m.selected).length !== 1 ? "Memories" : "Memory"} selected
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


