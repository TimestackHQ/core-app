import { Dimensions, View } from "react-native";
import Pinchable from "react-native-pinchable";
import TimestackMedia from "./TimestackMedia";
import FastImage from "react-native-fast-image";
import * as React from "react";
import { useEffect } from "react";
import { MediaInternetType } from "@shared-types/*";
import HTTPClient from "../httpClient";

const { width, height } = Dimensions.get('window');

export default function InnerMediaHolder({ selfIndex, currentIndex, item, holderId, holderType }: {
    item: MediaInternetType,
    holderId: string,
    holderType: "socialProfile" | "event",
    selfIndex: number,
    currentIndex: number
}) {


    const [media, setMedia] = React.useState<MediaInternetType>(item.isPlaceholder ? null : item);
    const [videoLoaded, setVideoLoaded] = React.useState(false);
    const [itemInView, setItemInView] = React.useState(false);

    useEffect(() => {
        if (selfIndex == currentIndex ||
            selfIndex == currentIndex - 1 ||
            selfIndex == currentIndex + 1) setItemInView(true);
        else setItemInView(false);
        console.log("selfIndex", selfIndex, "currentIndex", currentIndex, "itemInView", itemInView)
    }, [currentIndex])

    useEffect(() => {
        const url = `/media/view/${item._id}/${holderId}${holderType === "socialProfile" ? "?profile=true" : ""}`;
        if (itemInView) HTTPClient(url, "GET").then(res => {
            setMedia({
                ...item,
                fullsize: res.data.media.fullsize,
                thumbnail: res.data.media.thumbnail,
            });
        })
    }, [itemInView])


    return media ? <View style={{ flex: 1, width, height: 10000 }}>

        <Pinchable maximumZoomScale={item.type === "video" ? 1 : 5} style={{
            backgroundColor: "transparent",
            width, height: "100%",
        }}>

        {item.type === "image" ? <TimestackMedia
            itemInView={itemInView}
            type={media.type}
            onLoad={setVideoLoaded}
            source={media.fullsize}
            resizeMode={FastImage.resizeMode.contain}
            style={{ position: "absolute", top: 0, zIndex: 1, width, height: 0.8 * height, backgroundColor: "transparent" }}
        /> : null}

        {item.type === "image" ? <TimestackMedia
            itemInView={itemInView}
            type={"image"}
            source={media.thumbnail}
            resizeMode={FastImage.resizeMode.contain}
            style={{ position: "absolute", top: 0, zIndex: 0, width, height: 0.8 * height, backgroundColor: "transparent" }}
        /> : null}


        </Pinchable>

        {item.type === "video" ? <TimestackMedia
            itemInView={itemInView}
            type={"image"}
            source={media.thumbnail}
            resizeMode={FastImage.resizeMode.contain}
            style={{ position: "absolute", top: 0, zIndex: 3, width, height: "100%", backgroundColor: "black" }}
        /> : null}

        {item.type === "video" && itemInView ? <TimestackMedia
            itemInView={itemInView}
            autoPlay={currentIndex === selfIndex}
            type={"video"}
            source={media.fullsize}
            resizeMode={FastImage.resizeMode.contain}
            onLoad={setVideoLoaded}
            style={{ position: "absolute", top: 0, zIndex: 0, width: width, height: "100%", backgroundColor: "transparent" }}
        /> : null}





    </View> : <View style={{ width, height: "100%" }} />
}