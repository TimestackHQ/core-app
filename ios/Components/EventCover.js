import { Image } from "react-native";

export default function EventCover ({thumbnailUrl}) {
    return <Image style={{
        width: "100%",
        height: "100%",
        borderRadius: 15,
        objectFit: "cover",
        borderColor: "black",
        borderWidth: thumbnailUrl ? 0 : 1,
    }} source={{uri: thumbnailUrl}}/>
}