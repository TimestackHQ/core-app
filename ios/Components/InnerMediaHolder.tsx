import {Dimensions, TouchableWithoutFeedback, View} from "react-native";
import Pinchable from "react-native-pinchable";
import TimestackMedia from "./TimestackMedia";
import FastImage from "react-native-fast-image";
import * as React from "react";
import {useEffect} from "react";

const { width } = Dimensions.get('window');

export default function InnerMediaHolder ({item, itemInView}) {

    const [videoLoaded, setVideoLoaded] = React.useState(false);

    useEffect(() => {
        if(!itemInView) setVideoLoaded(false);
    }, [itemInView]);

    return <TouchableWithoutFeedback >
        <View style={{ width, height: "100%" }}>

            {item.type === "video" && !videoLoaded ? <TimestackMedia
                type={"image"}
                source={item.thumbnail}
                resizeMode={FastImage.resizeMode.contain}
                style={{ zIndex: 3, width, height: "100%", backgroundColor: "black" }}
            /> : null}

            <Pinchable maximumZoomScale={item.type === "video" ? 1 : 5}>
                {item.type === "image" || itemInView ? <View style={{ width, height: "100%" }}>

                    <TimestackMedia
                        type={item.type}
                        // priority={FastImage.priority.high}
                        onLoad={setVideoLoaded}
                        source={item.storageLocation}
                        resizeMode={FastImage.resizeMode.contain}
                        style={{ zIndex: 1, width, height: "100%", backgroundColor: "black" }}
                    />
                </View> : null}
            </Pinchable>
            {item.type === "image" ? <TimestackMedia
                type={"image"}
                // priority={FastImage.priority.high}
                source={item.thumbnail}
                resizeMode={FastImage.resizeMode.contain}
                style={{ zIndex: 1, width, height: "100%" }}
            /> : null}

        </View>
    </TouchableWithoutFeedback>
}