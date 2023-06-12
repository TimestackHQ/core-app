import FastImage, { Priority, ResizeMode } from "react-native-fast-image"
import Video from "react-native-video";
import { Request } from "aws4";

export default function TimestackMedia({
    source,
    type,
    resizeMode,
    style,
    priority,
}: {
    source: Request,
    type: "image" | "video",
    resizeMode?: ResizeMode,
    style?: any,
    priority?: Priority
}) {

    return type === "video" ? <Video
        muted={true}
        paused={true}
        style={style}
        source={{
            uri: "https://" + source.host + source.path,
            headers: source.headers,
            cache: FastImage.cacheControl.immutable,
            priority: priority
        }}
    /> : <FastImage
        style={style}
        resizeMode={resizeMode}
        source={{
            uri: "https://" + source.host + source.path,
            // @ts-ignore
            headers: source.headers,
            cache: FastImage.cacheControl.immutable,
            priority: priority
        }}
    />

}