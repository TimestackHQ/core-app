import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ListOfPeople from "../Components/People/List";
import React from "react";
import { useQuery } from "react-query";
import { getEvents } from "../queries/events";
import { listProfiles } from "../queries/profiles";
import EventsList from "./EventsList";
import TextComponent from "../Components/Library/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export default function HolderSelectorScreen({
    setGlobalTab
}) {

    const [tab, setTab] = React.useState<"people" | "events">("people");

    const [searchQuery, setSearchQuery] = React.useState("");


    const { data: events, status: eventsStatus, refetch: refreshEvents } = useQuery(["events", {}], getEvents, {
        enabled: tab === "people" || tab === "events",
    });
    const { data: profiles, status: profilesStatus, refetch: refreshProfiles } = useQuery(["profiles", { searchQuery }], listProfiles, {
        enabled: tab === "events" || tab === "people",
    });




    const [selectedProfiles, setSelectedProfiles] = React.useState<string[]>([]);

    return <View style={{ flex: 1, flexDirection: "column", backgroundColor: "white" }}>
        <View>
            <TouchableOpacity onPress={() => {
                setGlobalTab("roll");
            }}>
                <Image
                    source={require("../assets/icons/collection/back.png")}
                    style={{ marginLeft: 0, margin: 15, width: 40, height: 20, zIndex: 1, resizeMode: "contain" }}
                />
            </TouchableOpacity>
        </View>
        <SafeAreaView style={{
            zIndex: 2,
            position: "absolute",
            bottom: 0,
            width: "100%",
            alignItems: "center",
        }}>
            <View style={{
                width: "90%",
                height: 50,
                borderRadius: 100,
                backgroundColor: "#F0F0F0",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: 'black',
                shadowOffset: {
                    width: 0,
                    height: 0
                },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5
            }}>
                <View style={tab === "people" ? containerStyles.selected : containerStyles.unselected}>

                    <TouchableWithoutFeedback onPress={() => setTab("people")}>
                        <TextComponent fontFamily="Semi Bold" style={tab === "people" ? containerTextStyles.selected : containerTextStyles.unselected}>
                            People
                        </TextComponent>
                    </TouchableWithoutFeedback>

                </View>

                <View style={tab === "events" ? containerStyles.selected : containerStyles.unselected}>
                    <TouchableWithoutFeedback onPress={() => {
                        setTab("events");
                    }} >
                        <TextComponent fontFamily="Semi Bold" style={tab === "events" ? containerTextStyles.selected : containerTextStyles.unselected}>
                            Events
                        </TextComponent>
                    </TouchableWithoutFeedback>
                </View>
            </View>
            <TouchableOpacity style={{
                flex: 2,
                zIndex: 3,
                width: "90%",
                height: 55,
                backgroundColor: "white",
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 25,
                shadowColor: 'gray',
                shadowOffset: {
                    width: 0,
                    height: 0
                },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                marginTop: 15,
                elevation: 5
            }}>
                <Text style={{ fontSize: 20, fontFamily: "Red Hat Display Semi Bold", zIndex: 3, color: "black" }}>
                    SEND
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
        {tab === "people" ? <ListOfPeople
            mode="multiselect"
            refresh={() => {
                refreshProfiles();
                // refreshEvents();
            }}
            people={profiles}
            selectedProfiles={selectedProfiles}
            profileSelected={(profileId) => {
                if (selectedProfiles.includes(profileId)) {
                    setSelectedProfiles(selectedProfiles.filter((profile) => profile !== profileId));
                } else {
                    setSelectedProfiles([...selectedProfiles, profileId]);
                }
            }}
            style={{ height: "100%", padding: 10, paddingTop: 10 }}
            loading={profilesStatus === "loading"}
        /> : <EventsList />}
    </View>
}

const containerTextStyles = StyleSheet.create({
    selected: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    },
    unselected: {
        color: "#A6A6A6",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
    }
})

const containerStyles = StyleSheet.create({

    selected: {
        width: "50%",
        borderRadius: 100,
        backgroundColor: 'white',
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#F0F0F0",
        borderWidth: 5,
    },
    unselected: {
        width: "50%",
        borderRadius: 100,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#F0F0F0",
        borderWidth: 5,
    }
})