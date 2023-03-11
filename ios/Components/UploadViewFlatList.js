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

export default function UploadViewFlatList ({eventId, media, fetchMedia, pickImage, selecting, selectMedia}) {
	return (
		<FlatList
			style={{height: selecting ? "89%" : "100%"}}
			data={[
				"loader",
				...media,
			]}
			numColumns={3}
			renderItem={((raw) => {
				const media = raw.item;
				if(media === "loader") return <View onTouchStart={async () => selecting ? null : await pickImage(eventId)} style={styles.item}>
					{selecting ? null : <FastImage alt={"Cassis 2022"} style={{borderRadius: 0, width: "100%", height: 180}} source={require("../assets/add-media.png")}/>}

				</View>;
				return <View style={{...styles.item, opacity: selecting && !media.selected ? 0.5 : 1}} >
					<View
						style={{
							position: 'absolute',
							right: 5,
							bottom: 5,
							zIndex: 1,
							backgroundColor: 'transparent',
						}}
					>
						<FastImage source={require("../assets/icons/select.png")} style={{width: 20, height: 20, opacity: selecting && media.selected ? 1 : 0}}/>
					</View>
					<TouchableWithoutFeedback
						title={""}
						onPress={() => {
							if(selecting) {
								media.selected = !media.selected;
								selectMedia(media._id, media.selected);
							}
						}}>
						{media.type === "video" ?
							<Video
								source={{uri: media.thumbnail}}
								poster={media.snapshot}
								posterResizeMode="cover"
								muted={true}
								resizeMode="cover"
								style={{
									width: "100%",
									height: 180,

								}}
							/>
							: <FastImage  alt={"Cassis 2022"} style={{borderRadius: 0, width: "100%", height: 180}} source={{uri: media.thumbnail}}/>
						}
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
	    backgroundColor: "#efefef",
		height: 180,
		margin: 0.5
	},
});