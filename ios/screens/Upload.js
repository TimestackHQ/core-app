import {View, Text, StatusBar, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList} from "react-native";
import * as React from "react";
import HTTPClient from "../httpClient";
import {useEffect} from "react";
import * as ImagePicker from "expo-image-picker";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import Video from 'react-native-video';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		backgroundColor: '#fff',
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

export default function Upload ({payload}) {

	const [event, setEvent] = React.useState(payload.event);
	const [totalMediaCount, setTotalMediaCount] = React.useState(payload.event.mediaCount);
	const [selfMediaCount, setSelfMediaCount] = React.useState(0);
	const [uri, setUri] = React.useState(null);

	const [pendingMedia, setPendingMedia] = React.useState([]);
	const [media, setMedia] = React.useState([]);
	const [importing, setImporting] = React.useState(false);

	const fetchMedia = async () => {
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
		}, 1000);

		return () => {
			clearInterval(queue);
		}
	}, [event]);

	useEffect(() => {
		HTTPClient("/events/"+payload?.eventId+"/media/byme").then(res => setSelfMediaCount(res.data));
	}, [pendingMedia])

	const pickImage = async (eventId) => {

		setImporting(true);

		try {

			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsMultipleSelection: true,
				exif: true,
				quality: 0,
			});

			if (!result.canceled) {

				for await (const media of _.uniq(result.assets)) {

					ExpoJobQueue.addJob("mediaQueueV3", {
						...media,
						eventId
					})

				}

				ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

			}


		}catch(err) {
			console.log(err, "err")
		}

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
						flex: 6
					}}>
						{selfMediaCount} Memories by me <Text style={{
							fontFamily: 'Red Hat Display Regular',
							fontSize: 14,
							fontWeight: "300",
							margin: 10,
							marginLeft: 100,
							color: "#E4D017",
							flex: 5
						}}> {pendingMedia.length} Uploading {importing ?<Text style={{
						fontFamily: 'Red Hat Display Semi Bold',
						fontSize: 15,
						fontWeight: "300",
						margin: 10,
						marginLeft: 100,
						color: "green",
						flex: 5
					}}> Importing...
					</Text> : null}
						</Text>
					</Text>

				</View>


						<FlatList
							data={[
								"loader",
								...pendingMedia,
								...media,
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
								return <View style={{...styles.item, backgroundColor: "white"}}>
									<Image alt={"Cassis 2022"}
									       style={{borderRadius: 0, width: "100%", height: 180}}
									       source={{uri: media.thumbnail}}/>
								</View>;
							})}
							keyExtractor={(item, index) => index.toString()}
							onEndReached={() => fetchMedia()}
							onEndReachedThreshold={0.5}

						/>
			</View>


		</View>
	);
}


