import { Image } from "react-native";
import FastImage from "react-native-fast-image";

export default function EventCover ({thumbnailUrl}) {
    return <FastImage style={{
        width: "100%",
        height: "100%",
        borderRadius: 15,
        objectFit: "cover",
        borderColor: "black",
        borderWidth: thumbnailUrl ? 0 : 1,
    }} source={{uri: thumbnailUrl, cache: FastImage.cacheControl.web}}/>
}