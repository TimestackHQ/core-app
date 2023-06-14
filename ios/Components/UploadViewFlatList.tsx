import {
	FlatList,
	Button,
	Image,
	View,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	TouchableOpacity
} from "react-native";
import FastImage from 'react-native-fast-image'
import Video from "react-native-video";
import * as React from "react";
import TimestackMedia from "./TimestackMedia";

export default function UploadViewFlatList({ eventId, pendingMedia, media, fetchMedia, pickImage, selecting, selectMedia }) {
	return (
		<FlatList
			style={{ height: selecting ? "89%" : "100%" }}
			data={pendingMedia.length === 0 ? [
				"loader",
				...media,
			] : [
				"loader",
				...pendingMedia,
			]}
			numColumns={3}
			renderItem={((raw) => {
				const media = raw.item;
				if (media === "loader") return <View onTouchStart={async () => selecting ? null : await pickImage(eventId)} style={styles.item}>
					{selecting ? null : <FastImage style={{ borderRadius: 0, width: "100%", height: 180 }} source={require("../assets/add-media.png")} />}

				</View>;
				if (media?.pending) {
					return <View style={{ ...styles.item, backgroundColor: "white" }}>
						<Image alt={"Cassis 2022"} style={{ borderRadius: 0, width: "100%", height: 180, opacity: 0.5 }} source={{ uri: media?.uri }} />
					</View>
				}
				return <View style={{ ...styles.item, opacity: selecting && !media.selected ? 0.5 : 1 }} >
					<View
						style={{
							position: 'absolute',
							right: 5,
							bottom: 5,
							zIndex: 1,
							backgroundColor: 'transparent',
						}}
					>
						<FastImage source={require("../assets/icons/select.png")} style={{ width: 20, height: 20, opacity: selecting && media.selected ? 1 : 0 }} />
					</View>
					<TouchableWithoutFeedback
						onPress={() => {
							alert("hey")
							if (selecting) {
								media.selected = !media.selected;
								selectMedia(media._id, media.selected);
							}
						}}>
						<View>
							<TimestackMedia style={{ borderRadius: 0, width: "100%", height: 180, zIndex: -3 }} source={media?.thumbnail} />
						</View>
					</TouchableWithoutFeedback>


				</View>
			})}
			keyExtractor={(item, index) => index.toString()}
			onEndReached={() => fetchMedia()}
			onEndReachedThreshold={1.5}

		/>

	);
}

const styles = StyleSheet.create({
	item: {
		width: '33%', // 30% to account for space between items
		backgroundColor: "#EFEFEF",
		height: 180,
		margin: 0.5
	},
});