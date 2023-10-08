import FastImage, { Priority, ResizeMode } from "react-native-fast-image"
import Video from "react-native-video";
import { Request } from "aws4";
import { View } from "react-native";
import convertToProxyURL from 'react-native-video-cache';
import { SharedElement } from "react-navigation-shared-element";

export default function TimestackMedia({
    autoPlay = false,
    itemInView = true,
    source,
    type = "image",
    resizeMode,
    style,
    priority,
    onLoad,
    noBorder
}: {
    autoPlay?: boolean,
    itemInView: boolean,
    source: Request,
    type?: "image" | "video",
    resizeMode?: ResizeMode,
    style?: any,
    priority?: Priority,
    onLoad?: (loaded: boolean) => void,
    noBorder?: boolean
}) {

    return source ? type === "video" ? <Video
        paused={!autoPlay}
        controls={true}
        onReadyForDisplay={(value) => onLoad(true)}
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
                borderWidth: noBorder ? 0 : 1,
                borderColor: "black"
            }}
        />

}