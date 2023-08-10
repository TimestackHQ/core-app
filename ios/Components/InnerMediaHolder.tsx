import { Dimensions, Text, TouchableWithoutFeedback, View } from "react-native";
import Pinchable from "react-native-pinchable";
import TimestackMedia from "./TimestackMedia";
import FastImage from "react-native-fast-image";
import * as React from "react";
import { useEffect } from "react";
import { MediaInternetType } from "@shared-types/*";
import HTTPClient from "../httpClient";
import TextComponent from "./Library/Text";
import {SharedElement} from "react-navigation-shared-element";

const { width } = Dimensions.get('window');

export default function InnerMediaHolder({ item, itemInView, holderId, holderType }: {
    item: MediaInternetType,
    itemInView: Boolean,
    holderId: string,
    holderType: "socialProfile" | "event",
}) {


    const [media, setMedia] = React.useState<MediaInternetType>(item.isPlaceholder ? null : item);
    const [videoLoaded, setVideoLoaded] = React.useState(false);

    useEffect(() => {
        if (itemInView) setVideoLoaded(true);

    }, [itemInView]);

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


    return <TouchableWithoutFeedback >
        {media ? <View style={{ width, height: "100%" }}>
            {item.type === "video" && !videoLoaded ? <TimestackMedia
                type={"image"}
                source={media.thumbnail}
                resizeMode={FastImage.resizeMode.contain}
                style={{ position: "absolute", top: 0, zIndex: 3, width, height: "100%", backgroundColor: "black" }}
            /> : null}

            <Pinchable maximumZoomScale={item.type === "video" ? 1 : 5} style={{
                    backgroundColor: "transparent",
                    width, height: "100%",
                }}>
                {/*{item.type === "image" ? <TimestackMedia*/}
                {/*    type={media.type}*/}
                {/*    onLoad={setVideoLoaded}*/}
                {/*    source={media.fullsize}*/}
                {/*    resizeMode={FastImage.resizeMode.contain}*/}
                {/*    style={{ position: "absolute", top: 0,  zIndex: 1, width, height: "100%", backgroundColor: "transparent" }}*/}
                {/*/>: null}*/}

                {item.type === "image" ? <TimestackMedia
                        type={"image"}
                        source={media.thumbnail}
                        resizeMode={FastImage.resizeMode.contain}
                        style={{ position: "absolute", top: 0,  zIndex: 0, width: width, height: "100%", backgroundColor: "transparent" }}
                    /> : null}


            </Pinchable>

            {item.type === "video" ? <TimestackMedia
                type={"image"}
                source={media.thumbnail}
                resizeMode={FastImage.resizeMode.contain}
                style={{ position: "absolute", top: 0,  zIndex: 0, width: width, height: "100%", backgroundColor: "transparent" }}
            /> : null}



        </View> : <View style={{ width, height: "100%" }} />}
    </TouchableWithoutFeedback>
}