import React from "react";
import { useQuery } from "react-query";
import { getEvents } from "../queries/events";
import {Image, RefreshControl, Text, View} from "react-native";
import TextComponent from "../Components/Library/Text";
import TimestackMedia from "../Components/TimestackMedia";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { EventScreenNavigationProp } from "../navigation";
import { dateFormatter } from "../utils/time";
import ProfilePicture from "../Components/ProfilePicture";
import EventsList from "../Components/EventsList";


export default function EventsListScreen() {

    const [searchQuery, setSearchQuery] = React.useState("");


    const { data: events, status: eventsStatus, refetch: refreshEvents } = useQuery(["events", {q: searchQuery}], getEvents);


    const navigation = useNavigation<
        EventScreenNavigationProp
    >();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            // @ts-ignore
            headerSearchBarOptions: {
                hideWhenScrolling: false,
                visible: true,
                onChangeText: (event) => {
                    console.log(event.nativeEvent.text);
                    setSearchQuery(event.nativeEvent.text);
                }
            }
        });
    }, [navigation]);

    return (
        <View style={{
            flex: 1,
            backgroundColor: "white",
        }}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={eventsStatus === "loading"}
                        onRefresh={() => {
                            refreshEvents();
                        }}
                    />
                }
                style={{ flex: 1, height: "100%", backgroundColor: "white", paddingTop: 10, paddingHorizontal: 10 }}
            >
                <EventsList events={events ? events : []} />
            </ScrollView>

        </View>
    );



}