import { SocialProfileInterface, UserInterface } from "@shared-types/public";
import { RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import HTTPClient from "../httpClient";
import { MediaViewScreenNavigationProp, RollScreenNavigationProp, RootStackParamList, UploadQueueScreenNavigationProp } from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import { FlatList, RefreshControl, TouchableWithoutFeedback } from "react-native-gesture-handler";
import ConnectionStatus from "../Components/ConnectionStatus";
import TimestackMedia from "../Components/TimestackMedia";
import { RollType } from "../types/global";
import { useQueueCounter } from "../hooks/queue";
import UploadQueueTracker from "../Components/UploadQueueTracker";
import { useAppDispatch } from '../store/hooks'
import { setRoll } from "../store/rollState";
import FastImage from "react-native-fast-image";
import NoSharedMemories from "../Components/Library/NoSharedMemories";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";


export default function SocialProfile({ }) {

    const dispatch = useAppDispatch()
    const [profile, setProfile] = useState<SocialProfileInterface>(null);

    const [selectionMode, setSelectionMode] = useState(false);
    const route = useRoute<RouteProp<RootStackParamList, "SocialProfile">>();
    const navigator = useNavigation<RollScreenNavigationProp | UploadQueueScreenNavigationProp | MediaViewScreenNavigationProp>();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState<
        "memories" | "events"
    >("memories");
    const queueCounter = useQueueCounter(profile?._id.toString());

    const [user, setUser] = useState<UserInterface>(null);
    const [gallery, setGallery] = useState<any[]>([]);
    const [selected, setSelected] = useState({});

    useEffect(() => {
        console.log(queueCounter);
        if (queueCounter === 0) {
            getGallery(true);
        }
    }, [queueCounter])

    useEffect(() => {




        if (isFocused) {

            HTTPClient("/social-profiles/user/" + route.params?.userId, "GET").then(res => {
                setProfile(res.data);
                const user: UserInterface = res.data.users[0]
                setUser(user);
                const payload: RollType = {
                    holderId: res.data._id,
                    holderType: "socialProfile",
                    holderImageUrl: res.data.users[0].profilePictureSource,
                    profile: {
                        people: [{
                            firstName: user.firstName,
                            lastName: user.lastName,
                            profilePictureSource: user.profilePictureSource,
                            username: user.username,
                        }]
                    }

                }

                console.log(payload);
                dispatch(setRoll(payload))
                setTimeout(getGallery, 0);
            })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    setRefreshing(false);
                });
        } else {
            console.log("unfocused")

        }


    }, [isFocused, refreshing]);

    useFocusEffect(
        React.useCallback(() => {

            return () => {
                dispatch(setRoll({
                    holderType: "none",
                    holderUrl: undefined,
                    holderId: undefined,
                }));
                // setSelected({});
                // setSelectionMode(false);
            }
        }, [])
    );

    useEffect(() => {
        navigator.setOptions({
            headerShown: !selectionMode,
        })
    }, [selectionMode]);


    const getGallery = (flush = false) => {
        if (profile?._id) HTTPClient(`/social-profiles/${profile?._id}/media?skip=${String(flush ? 0 : gallery.length)}`, "GET")
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
                            width={42}
                            height={42}
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
        getGallery(true);
    }


    return <SafeAreaView style={{ flex: 1, backgroundColor: "white", flexDirection: "column" }}>
        {
            profile?._id ?
                <View style={{ flex: 1 }}>
                    {profile?._id ? <UploadQueueTracker style={{
                        position: "absolute",
                        bottom: "1%",
                        left: "2%",
                        height: 40,
                        zIndex: 1,
                        opacity: 1,
                        borderRadius: 20,
                    }} variant="shadow" holderId={String(profile?._id)} holderType={"socialProfile"} /> : null}


                    {selectionMode ? <View style={{ maxHeight: 50, flex: 1, flexDirection: "column" }}>
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            height: 0,
                            alignItems: "flex-end",
                        }}>

                        </View>
                        <View style={{ flexDirection: "row", height: "100%", margin: 0, backgroundColor: "white", borderColor: "black", borderBottomWidth: 1, paddingHorizontal: 14 }}>

                            <View style={{ flex: 1, flexDirection: "row", justifyContent: 'space-between', alignItems: "center" }}>
                                <TouchableOpacity onPress={() => {
                                    setSelectionMode(false);
                                    setSelected({});
                                }}>
                                    <Text style={{ fontFamily: "Red Hat Display Semi Bold", fontSize: 18 }}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={{ fontFamily: 'Red Hat Display Semi Bold', fontSize: 18 }}>
                                    {Object.keys(selected).length} {Object.keys(selected).length !== 1 ? "Memories" : "Memory"} selected
                                </Text>
                                <TouchableWithoutFeedback style={{ width: "100%" }} onPress={() => {

                                }}>
                                    <Image alt={"Cassis 2022"} style={{ borderRadius: 0, width: 30, height: 30, opacity: !Object.keys(selected).length ? 1 : 0.5 }} source={require("../assets/icons/Remove.png")} />
                                </TouchableWithoutFeedback>
                            </View>

                        </View>
                    </View> : null}


                    <FlatList
                        onEndReached={() => getGallery()
                        }
                        refreshControl={< RefreshControl refreshing={refreshing} onRefresh={() => {
                            refresh()
                        }} />}
                        data={gallery}
                        ListHeaderComponent={() => !selectionMode ? (
                            <View style={{ flex: 1, flexDirection: "column" }}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                                        <ConnectionStatus style={{ flex: 1, width: 150, margin: 15 }} refresh={refresh} profile={profile} user={user} />
                                    </View>
                                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                                    </View>
                                </View>
                                <View style={{ flexDirection: "row", marginTop: 10 }}>
                                    <View style={{
                                        flex: 1,
                                        marginBottom: -0.5,
                                        borderBottomWidth: 1,
                                        borderBottomColor: tab === "memories" ? "black" : "#8E8E93",
                                    }}>
                                        <TouchableOpacity style={{ width: "100%", alignItems: "center", justifyContent: "flex-end", }} onPress={() => setTab("memories")}>
                                            <FastImage
                                                resizeMode="contain"
                                                source={
                                                    tab === "memories" ?
                                                        require("../assets/icons/collection/memories-black.png")
                                                        : require("../assets/icons/collection/memories-gray.png")
                                                }
                                                style={{ width: 35, height: 35, marginBottom: 5 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{
                                        flex: 1,
                                        marginBottom: -0.5,
                                        borderBottomWidth: 1,
                                        borderBottomColor: tab === "events" ? "black" : "#8E8E93",
                                    }}>
                                        <TouchableOpacity style={{ width: "100%", alignItems: "center", justifyContent: "flex-end", }} onPress={() => setTab("events")}>
                                            <FastImage
                                                resizeMode="contain"
                                                source={
                                                    tab === "events" ?
                                                        require("../assets/icons/collection/events-black.png")
                                                        : require("../assets/icons/collection/events-gray.png")
                                                }
                                                style={{ width: 30, height: 30, marginBottom: 5 }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {profile?._id && gallery.length === 0 ? <NoSharedMemories /> : null}

                            </View>
                        ) : null}
                        numColumns={3}
                        renderItem={(raw) => {
                            const media = raw.item;

                            return <View style={{
                                width: '33%', // 30% to account for space between items
                                backgroundColor: "#efefef",
                                opacity: tab !== "memories" ? 0 : selectionMode ? selected[media._id] ? 1 : 0.5 : 1,
                                height: tab !== "memories" ? 0 : 180,
                                margin: 0.5
                            }}
                            >
                                <TouchableWithoutFeedback
                                    onLongPress={() => {
                                        ReactNativeHapticFeedback.trigger("impactLight");
                                        setSelectionMode(true);
                                    }}
                                    onPress={() => {
                                        if (selectionMode) {
                                            const selectedMutable = { ...selected };
                                            if (selected[media._id]) {
                                                delete selectedMutable[media._id];
                                            } else {
                                                selectedMutable[media._id] = media;
                                            }
                                            setSelected(selectedMutable);
                                            return;
                                        } else {
                                            navigator.navigate("MediaView", {
                                                mediaId: media._id,
                                                holderId: String(profile._id),
                                                holderType: "socialProfile",
                                                content: gallery,
                                                currentIndex: raw.index,
                                                hasPermission: media.hasPermission,
                                            });
                                        }
                                    }
                                    }
                                >
                                    <View>
                                        <TimestackMedia style={{ borderRadius: 0, width: "100%", height: 180 }} source={media.thumbnail} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        }}
                    />
                </View> : null}
    </SafeAreaView >

}