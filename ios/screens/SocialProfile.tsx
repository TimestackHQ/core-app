import { SocialProfileInterface, UserInterface } from "@shared-types/public";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ExpoJobQueue from "expo-job-queue";
import { BlurView } from '@react-native-community/blur';
import HTTPClient from "../httpClient";
import { MediaViewScreenNavigationProp, RollScreenNavigationProp, RootStackParamList, SocialProfileScreenNavigationProp, UploadQueueScreenNavigationProp, UploadScreenNavigationProp } from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import { FlatList, RefreshControl, TouchableWithoutFeedback } from "react-native-gesture-handler";
import ConnectionStatus from "../Components/ConnectionStatus";
import TimestackMedia from "../Components/TimestackMedia";
import SmallButton from "../Components/Library/SmallButton"
import { UploadItem } from "../types/global";
import { useQueueCounter } from "../hooks/queue";
import UploadQueueTracker from "../Components/UploadQueueTracker";


export default function SocialProfile({ }) {

    const [profile, setProfile] = useState<SocialProfileInterface>(null);


    const route = useRoute<RouteProp<RootStackParamList, "SocialProfile">>();
    const navigator = useNavigation<RollScreenNavigationProp | UploadQueueScreenNavigationProp | MediaViewScreenNavigationProp>();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState("memories");
    // const queueCounter = useQueueCounter(profile?._id);


    const [user, setUser] = useState<UserInterface>(null);
    const [gallery, setGallery] = useState<any[]>([]);

    useEffect(() => {


        if (isFocused) {
            HTTPClient("/social-profiles/user/" + route.params?.userId, "GET").then(res => {
                setProfile(res.data);
                setUser(res.data.users[0]);
                setTimeout(getGallery, 0);
            })
                .catch((error) => {
                })
                .finally(() => {
                    setRefreshing(false);
                });
        }


    }, [isFocused, refreshing]);

    // useEffect(() => {
    //     console.log(queueCounter);
    // }, [queueCounter]);

    const getGallery = (flush = false) => {
        setGallery(flush ? [] : gallery)
        HTTPClient(`/social-profiles/${profile?._id}/media?skip=${String(flush ? 0 : gallery.length)}`, "GET")
            .then(res => {
                setGallery(flush ? [...res.data.media] : [...gallery, ...res.data.media]);
            });
    }

    useEffect(() => {
        navigator.setOptions({
            headerBackTitle: "Back",
            headerShown: true,
            headerTitle: () => (
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <ProfilePicture
                            userId={String(user?._id)}
                            width={40}
                            height={40}
                            style={{ marginRight: 10 }}
                            location={user?.profilePictureSource}
                        />
                    </View>
                    <View style={{ flex: 3, alignItems: "flex-start" }}>
                        <Text style={{
                            fontSize: 18, fontFamily: "Red Hat Display Bold",
                            marginBottom: 0
                        }}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={{
                            fontSize: 16, fontFamily: "Red Hat Display Regular", marginTop: -5
                        }}>
                            {user?.username}
                        </Text>
                    </View>
                </View>
            )
        });
    }, [profile, user]);

    const refresh = () => {
        setRefreshing(true);
    }


    return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {profile?._id ? <UploadQueueTracker style={{
            position: "absolute",
            bottom: "1%",
            left: "2%",
            height: 40,
            zIndex: 1,
            opacity: 1,
            borderRadius: 20,
        }} variant="shadow" holderId={String(profile?._id)} holderType={"socialProfile"} /> : null}
        {
            profile?._id ? <FlatList
                style={{ flex: 1 }
                }
                onEndReached={() => getGallery()
                }
                refreshControl={< RefreshControl refreshing={refreshing} onRefresh={() => {
                    refresh()
                }} />}
                data={gallery}
                ListHeaderComponent={() => (
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <ConnectionStatus style={{ flex: 1, width: "100%", margin: 10 }} refresh={refresh} profile={profile} user={user} />
                        <SmallButton style={{ flex: 1, margin: 10 }} variant="positive" body="Upload" onPress={() => {
                            navigator.navigate("Roll", {
                                holderId: String(profile?._id),
                                holderType: "socialProfile"
                            });
                        }} />
                    </View>
                )}
                numColumns={3}
                renderItem={(raw) => {
                    const media = raw.item;

                    return <View style={{
                        width: '33%', // 30% to account for space between items
                        backgroundColor: "#efefef",
                        opacity: tab !== "memories" ? 0 : 1,
                        height: tab !== "memories" ? 0 : 180,
                        margin: 0.5
                    }}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => {
                                navigator.navigate("MediaView", {
                                    mediaId: media._id,
                                    holderId: String(profile._id),
                                    holderType: "socialProfile",
                                    content: gallery,
                                    currentIndex: raw.index,
                                    hasPermission: true
                                })
                            }
                            }
                        >
                            <View>
                                <TimestackMedia style={{ borderRadius: 0, width: "100%", height: 180 }} source={media.thumbnail} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                }}
            /> : null}
    </SafeAreaView >

}