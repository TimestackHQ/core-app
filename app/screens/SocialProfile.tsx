import _ from "lodash";
import { MediaInternetType, UserInterface } from "@shared-types/public";
import { RouteProp, useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {FlatList, RefreshControl, ScrollView, TouchableWithoutFeedback} from "react-native-gesture-handler";
import FastImage from "react-native-fast-image";
import {Alert, Image, SafeAreaView, Share, TouchableOpacity, View} from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import {
    MediaViewScreenNavigationProp,
    RollScreenNavigationProp,
    RootStackParamList,
    SocialProfileSettingsScreenNavigationProp,
    UploadQueueScreenNavigationProp
} from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import ConnectionStatus from "../Components/ConnectionStatus";
import TimestackMedia from "../Components/TimestackMedia";
import { RollType } from "../types/global";
import UploadQueueTracker from "../Components/UploadQueueTracker";
import { useAppDispatch } from '../store/hooks'
import { setRoll } from "../store/rollState";
import NoSharedMemories from "../Components/Library/NoSharedMemories";
import { useQuery } from "react-query";
import { getSocialProfile } from "../queries/profiles";
import HTTPClient from "../httpClient";
import { flattenGallery } from "../utils/gallery";
import TextComponent from "../Components/Library/Text";
import { getMutuals } from "../queries/people";
import Mutuals from "../Components/People/Mutuals";
import {getEvents, getMutualEvents} from "../queries/events";
import EventsList from "../Components/EventsList";
import {useActionSheet} from "@expo/react-native-action-sheet";
import {frontendUrl} from "../utils/io";

export default function SocialProfile({ }) {

    const dispatch = useAppDispatch();

    const { showActionSheetWithOptions } = useActionSheet();


    const route = useRoute<RouteProp<RootStackParamList, "SocialProfile">>();
    const navigator = useNavigation<RollScreenNavigationProp | UploadQueueScreenNavigationProp | MediaViewScreenNavigationProp | SocialProfileSettingsScreenNavigationProp>();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);

    const { data: profile, refetch: refetchProfile } = useQuery(["social-profiles", { userId: route.params?.userId }], getSocialProfile, {
        enabled: !!route.params?.userId
    });
    const { data: mutuals } = useQuery(["get-mutuals", { targetUserId: route.params?.userId, getAll: false }], getMutuals, {
        enabled: !!route.params?.userId
    });

    const [tab, setTab] = useState<
        "memories" | "events"
    >("memories");
    const queueCounter = 0;

    const user = profile?.users[0]
    const [gallery, setGallery] = useState<MediaInternetType[]>([]);

    const { data: events, status: eventsStatus, refetch: refreshEvents } = useQuery(["events", {userId: route.params?.userId}], getMutualEvents, {
        enabled: !!route.params?.userId
    });


    useEffect(() => {
        console.log(queueCounter);
        const isQueueEmpty = queueCounter === 0;
        if (isQueueEmpty) {
            getGallery(true);
        }
    }, [queueCounter])

    useEffect(() => {

        if (profile) {
            const user: UserInterface = profile.users[0]

            setTimeout(getGallery, 0);
            navigator.setOptions({
                headerBackTitle: "Back",
                headerShown: true,
                headerStyle: {
                    height: 1000,
                },
                headerTitle: () => (
                    <View style={{ flex: 1, flexDirection: "row", marginBottom: 50 }}>
                        <TouchableOpacity onPress={() => {

                            const options = ['Block', 'Cancel', 'Report', 'Share this profile', 'Copy profile URL'];
                            const destructiveButtonIndex = 0;
                            const cancelButtonIndex = 1;

                            showActionSheetWithOptions({
                                title: user?.firstName + " " + user?.lastName,
                                titleTextStyle: {
                                    fontFamily: "Red Hat Display",
                                    fontSize: 16,
                                },
                                options,
                                cancelButtonIndex,
                                showSeparators: true,
                                destructiveButtonIndex
                            }, async (selectedIndex: number) => {
                                switch (selectedIndex) {
                                    case 1:
                                        // Save
                                        break;

                                    case destructiveButtonIndex:
                                        Alert.alert("Block", `Blocking is not available on this private beta version. Send us a DM if you really need to block ${user.firstName}.`, [{
                                            text: "OK"
                                        }])
                                        break;

                                    case 2:
                                        Alert.alert("Report", `Reporting is not available on this private beta version. Send us a DM if you really need to report ${user.firstName}.`, [{
                                            text: "OK"
                                        }])
                                        break;
                                    case 3:
                                        await Share.share({
                                            url: frontendUrl + "/user/" + route.params.userId,
                                            title: "Check out " + user.firstName + " " + user.lastName + "'s profile on Timestack!"
                                        }, {
                                            subject: "Check out " + user.firstName + " " + user.lastName + "'s profile on Timestack!"
                                        });
                                        break
                                    case 4:
                                        Clipboard.setString(frontendUrl + "/user/" + route.params.userId);
                                        Alert.alert("Copied", "Copied profile URL to clipboard.", [{
                                            text: "OK"
                                        }])
                                        break;

                                    case cancelButtonIndex:
                                    // Canceled
                                }});

                            // user && profile ? navigator.navigate("SocialProfileSettings", {
                            //     user: {
                            //         _id: user._id.toString(),
                            //         username: user.username,
                            //         firstName: user.firstName,
                            //         lastName: user.lastName,
                            //         profilePictureSource: user.profilePictureSource,
                            //         profileId: profile._id.toString(),
                            //     },
                            //     profile: profile,
                            // }) : null

                        }} style={{
                            flex: 1,
                            flexDirection: "row",
                        }}>
                            <View style={{flexDirection: "row", flexBasis: "auto"}}>
                                <View style={{alignItems: "flex-end" }}>
                                    <ProfilePicture
                                        userId={String(user?._id)}
                                        width={42}
                                        height={42}
                                        style={{ marginRight: 10 }}
                                        location={user?.profilePictureSource}
                                    />
                                </View>
                                <View style={{alignItems: "flex-start" }}>
                                    <TextComponent numberOfLines={1} ellipsizeMode="tail" fontFamily={"Bold"} fontSize={16} style={{
                                        marginBottom: 0,
                                        marginTop: 2,
                                    }}>
                                        {user?.firstName} {user?.lastName}
                                    </TextComponent>
                                    <TextComponent fontFamily={"Regular"} fontSize={16} style={{
                                        marginTop: -5
                                    }}>
                                        {user?.username}
                                    </TextComponent>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            });
        }

        console.log(profile);

    }, [profile]);

    useEffect(() => {
        if (profile) {
            const payload: RollType = {
                holderId: profile._id,
                holderType: "socialProfile",
                holderImageUrl: profile.users[0].profilePictureSource,
                profile: {
                    people: [{
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        profilePictureSource: user?.profilePictureSource,
                        username: user?.username,
                    }]
                }
            }

            console.log(user)

            dispatch(setRoll(payload))
        }
    }, [profile, isFocused])

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


    const getGallery = (flush = false) => {
        setRefreshing(true);
        if (profile?._id) HTTPClient(`/social-profiles/${profile?._id}/media?skip=${String(flush ? 0 : gallery.length)}`, "GET")
            .then(res => {
                const content: MediaInternetType[] = res.data.content;
                if (flush) setGallery(_.uniq([...content]));
                else setGallery(_.uniq([...gallery, ...content]));
            })
            .finally(() => setRefreshing(false));
    }


    const refresh = () => {
        getGallery(true);
        refetchProfile();
        refreshEvents();
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



                    <FlatList
                        onEndReached={() => getGallery()}
                        refreshControl={< RefreshControl refreshing={refreshing} onRefresh={() => {
                            refresh()
                        }} />}
                        data={tab === "memories" ? gallery : []}
                        ListHeaderComponent={() => (
                            <View style={{ flex: 1, flexDirection: "column" }}>
                                <View style={{ flex: 1, flexDirection: "row", marginHorizontal: 10, marginVertical: 15 }}>
                                    <Mutuals
                                        targetUserId={route.params?.userId}
                                        mutualCount={mutuals?.mutualCount}
                                        mutuals={mutuals?.mutuals || []} />
                                </View>

                                <View style={{ flex: 1, flexDirection: "row", marginVertical: 10 }}>
                                    <View style={{ flex: 1, alignItems: "flex-start" }}>
                                        <ConnectionStatus style={{ flex: 1, width: 150, marginHorizontal: 15 }} refresh={refetchProfile} profile={profile} user={user} />
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
                                {tab === "events" ? <View style={{ flex: 1, flexDirection: "column", marginHorizontal: 10, marginVertical: 15 }}>

                                    <TextComponent fontFamily={"Semi Bold"} fontSize={16} style={{ marginBottom: 10 }}>Mutual Events</TextComponent>

                                    <ScrollView
                                        style={{ flex: 1, height: "100%", backgroundColor: "white" }}
                                    >
                                        <EventsList events={events ? events : []} />
                                    </ScrollView>

                                </View> : null}

                            </View>
                        )}
                        numColumns={3}
                        renderItem={(raw) => {
                            const media = raw.item;

                            return <View style={{
                                width: '33%',
                                backgroundColor: "#efefef",
                                height: tab !== "memories" ? 0 : 180,
                                margin: 0.5
                            }}
                            >
                                <TouchableWithoutFeedback
                                    onPress={() => {
                                        const flattenedGallery = flattenGallery(gallery);
                                            const index = flattenedGallery.findIndex((m: MediaInternetType) => m._id === media._id);
                                            navigator.navigate("MediaView", {
                                                mediaId: media._id,
                                                holderId: String(profile._id),
                                                holderType: "socialProfile",
                                                content: flattenedGallery,
                                                currentIndex: index,
                                                hasPermission: media.hasPermission,
                                            });
                                        }
                                    }
                                >
                                    <View>
                                        {media.isGroup ? <View style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            zIndex: 1,
                                            justifyContent: "flex-start",
                                            alignItems: "flex-end"
                                        }}>

                                            <FastImage
                                                source={require("../assets/icons/collection/group-white.png")}
                                                style={{ width: 18, height: 18, margin: 10 }}
                                            />

                                        </View> : null}
                                        <TimestackMedia itemInView style={{ borderRadius: 0, width: "100%", height: 180 }} source={media.thumbnail} />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        }}
                    />
                </View> : null}
    </SafeAreaView >

}
