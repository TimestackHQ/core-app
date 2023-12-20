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
            flex: 1, padding: 10, alignContent: "center", flexDirection: "column", backgroundColor: "white",
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
                position: "absolute",
                top: -40,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flex: 1,
                    marginLeft: 10, marginVertical: 15, marginTop: 10,
                    marginRight: 0

                }}>

                    {media?.people.length > 1 ? media?.people.map((user, i) => {
                        if (media.people.length > 7 && i === 7) {
                            return (
                                <TouchableWithoutFeedback style={{ marginLeft: 5 }}>
                                    <View>
                                        <View style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 30,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginLeft: 5,
                                            backgroundColor: "black",
                                            opacity: 0.6,
                                            zIndex: 1,
                                            position: "absolute",
                                            right: 0,
                                            bottom: 0,
                                        }}>
                                            <TextComponent
                                                fontSize={10}
                                                fontFamily={"Semi Bold"}
                                             style={{
                                                    color: "white",
                                             }}
                                            >{12 - 6}</TextComponent>
                                        </View>
                                        <ProfilePicture
                                            pressToProfile={false}
                                            key={i}
                                            userId={user?._id.toString()}
                                            width={20}
                                            height={20}
                                            location={user.profilePictureSource}
                                            style={{ marginLeft: 5 }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        } else if(i < 7) {
                            return (
                                <ProfilePicture
                                    key={i}
                                    userId={user._id.toString()}
                                    style={{ marginLeft: 5 }}
                                    width={20}
                                    height={20}
                                    location={user.profilePictureSource}
                                    pressToProfile={false}
                                />

                            );
                        } else {
                            return null;
                        }

                    }) : null}

                </View>
            </View>
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
                    <TouchableOpacity onPress={async () => {
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
                    </TouchableOpacity>



                </View>
            </View>
        </Animated.View>
    );
}

