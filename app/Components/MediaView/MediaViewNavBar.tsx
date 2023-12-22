import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated, Text,
    TouchableOpacity, TouchableWithoutFeedback,
    View
} from "react-native";
import ProfilePicture from "../ProfilePicture";
import FastImage from "react-native-fast-image";
import { MediaInView } from "@api-types/public";
import { useState } from "react";
import mediaDownload from "../../utils/mediaDownload";
import LinkContent from "./LinkContent";
import { MediaHolderTypesType } from "@shared-types/*";
import { useNavigation } from "@react-navigation/native";
import { LinkContentScreenNavigationProp } from "../../navigation";
import TextComponent from "../Library/Text";

export default function MediaViewNavBar({
    media,
    holderId,
    holderType,
}: {
    media: MediaInView,
    holderId: string,
    holderType: MediaHolderTypesType
}) {

    const [downloading, setDownloading] = useState(false);
    const navigator = useNavigation<LinkContentScreenNavigationProp>();

    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity of 0

    useEffect(() => {
        setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true
            }).start();
        }, 250);
    }, []);

    return (
        <Animated.View style={{
            flex: 2, padding: 10, alignContent: "center", flexDirection: "column", backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 1,
            opacity: fadeAnim, // Apply the animated opacity
        }}>

            <View style={{
                flex: 1,
                flexDirection: "row",
            }}>
                <View style={{
                    flexDirection: "row",
                    flex: 1,
                }}>
                    <ProfilePicture userId={media?.user?._id} location={media?.user?.profilePictureSource} width={35} height={35} />
                    <TextComponent
                        fontSize={17}
                        fontFamily={"Semi Bold"}
                        style={{
                            marginLeft: 10,
                            marginTop: 5,
                        }}
                    >
                        {media?.user?.firstName} {media?.user?.lastName}
                    </TextComponent>

                </View>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    flex: 1,
                }}>
                    <ActivityIndicator animating={downloading} color={"#4fc711"} style={{
                        marginTop: -40,
                        marginRight: 10,
                        width: 20,
                    }}/>
                    <TouchableOpacity onPress={() => {
                        setDownloading(true);
                        mediaDownload(media.fullsize, "download").finally(() => setDownloading(false));

                    }} style={{ marginTop: 5, marginRight: 5 }} >
                        <FastImage
                            source={require("../../assets/icons/download.png")}
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                    {holderType === "socialProfile" ? <TouchableOpacity onPress={async () => {
                        console.log("Linking content", media);
                        navigator.navigate("LinkContent", {
                            contentId: media?.contentId,
                            sourceHolderId: holderId,
                            holderType: holderType,
                        });

                    }} disabled={downloading} style={{ marginTop: 5, marginHorizontal: 5 }} >
                        <FastImage
                            resizeMode={"contain"}
                            source={require("../../assets/icons/peopleadd.png")}
                            style={{ width: 30, height: 20}}
                        />
                    </TouchableOpacity> : null}



                </View>
            </View>
        </Animated.View>
    );
}

