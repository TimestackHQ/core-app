import { Image } from "react-native";
import FastImage from "react-native-fast-image";

export default function EventCover ({thumbnailUrl}) {
    return <FastImage  source={{uri: thumbnailUrl, cache: FastImage.cacheControl.web}}/>
}