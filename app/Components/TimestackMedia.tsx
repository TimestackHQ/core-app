import FastImage, { Priority, ResizeMode } from "react-native-fast-image"
import Video from "react-native-video";
import { Request } from "aws4";
import { View } from "react-native";
import {SharedElement} from "react-navigation-shared-element";

export default function TimestackMedia({
    source,
    type = "image",
    resizeMode,
    style,
    priority,
    onLoad
}: {
    source: Request,
    type?: "image" | "video",
    resizeMode?: ResizeMode,
    style?: any,
    priority?: Priority,
    onLoad?: (loaded: boolean) => void
}) {

    return source ? type === "video" ? <Video
        autoplay={false}
        paused={false}
        controls={true}
        onLoad={() => setTimeout(() => onLoad(true), 250)}
        style={{
            ...style,
            zIndex: 10,
            backgroundColor: "transparent"

        }}
        ignoreSilentSwitch="ignore"
        source={{
            uri: `https://${source.host}/${source.path}`,
            headers: source.headers,
            priority: priority
        }}
    /> :
        <FastImage
            style={{
                ...style,
            }}
            resizeMode={resizeMode}
            source={{
                uri: `https://${source.host}/${source.path}`,
                // @ts-ignore
                headers: source.headers,
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