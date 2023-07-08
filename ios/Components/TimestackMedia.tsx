import FastImage, { Priority, ResizeMode } from "react-native-fast-image"
import Video from "react-native-video";
import { Request } from "aws4";
import { View } from "react-native";

export default function TimestackMedia({
    source,
    type = "image",
    resizeMode,
    style,
    priority,
}: {
    source: Request,
    type?: "image" | "video",
    resizeMode?: ResizeMode,
    style?: any,
    priority?: Priority
}) {

    return source ? type === "video" ? <Video

        paused={true}
        controls={true}
        style={{
            ...style,
            zIndex: 10,
        }}
        pictureInPicture={true}
        source={{
            uri: "https://" + source.host + source.path,
            headers: source.headers,
            cache: FastImage.cacheControl.immutable,
            priority: priority
        }}
    /> :
        <FastImage
            style={{
                ...style,
            }}
            resizeMode={resizeMode}
            source={{
                uri: "https://" + source.host + source.path,
                // @ts-ignore
                headers: source.headers,
                cache: FastImage.cacheControl.immutable,
                priority: priority
            }}
        />
        : <View
            style={{
                ...style,
                borderWidth: 1,
                borderColor: "black"
            }}
        />

}