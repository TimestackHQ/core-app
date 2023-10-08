import { Text, View, StyleSheet, FlatList } from "react-native"
import { getLinkedEvents } from "../../queries/events";
import { useQuery } from "react-query";
import TimestackMedia from "../TimestackMedia";
import { BlurView } from "@react-native-community/blur";
import TextComponent from "./Text";

import { Canvas, Blur, Image, useImage } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { EventScreenNavigationProp, LinkedEventsScreenNavigationProp } from "../../navigation";
import { EventObject } from "@api-types/public";

const cellHeight = 40;

export default function LinkedEvents({ eventId, eventName, linkedEvents }: {
    linkedEvents: {
        _id: string,
        name: string,
        thumbnailUrl?: EventObject["thumbnailUrl"],
        storageLocation?: EventObject["storageLocation"],
    }[],
    eventId: string,
    eventName: string,
}) {
    const navigation = useNavigation<
        LinkedEventsScreenNavigationProp |
        EventScreenNavigationProp
    >();

    return linkedEvents ? <View style={{
        flex: 1,
        flexDirection: "column"
    }}>
        <FlatList style={{
            flex: 1,
            overflow: 'hidden', // This is important to clip children
            paddingHorizontal: 4,
            paddingRight: 8,
            zIndex: 10,
        }}
            numColumns={2}
            data={linkedEvents.slice(0, 4)}
            renderItem={({ item: event, index }) => {
                return <View style={{
                    flex: 1, margin: 1,
                }}>
                    <TouchableOpacity style={{
                        width: "100%",
                    }} onPress={() => {
                        if (index < 3) navigation.push("Event", {
                            eventId: event._id,
                            eventName: event.name,
                        });
                        else navigation.push("LinkedEvents", {
                            eventId,
                            eventName
                        })
                    }}>
                        <View style={{
                            height: 50,
                            borderColor: "white",
                            borderWidth: 0.5,
                            borderRadius: 10,
                            overflow: "hidden",
                            width: "100%",
                            backgroundColor: "black",
                        }}>

                            <TextComponent
                                fontFamily="Semi Bold"
                                fontSize={20}
                                numberOfLines={1}
                                style={{
                                    zIndex: 2,
                                    width: "100%",
                                    textAlign: "center",
                                    marginTop: 10,
                                    marginBottom: 15,
                                    marginHorizontal: 5,
                                    color: "white",
                                    position: "absolute",
                                    shadowColor: "black",
                                    shadowOpacity: 1,
                                    shadowOffset: {},
                                    shadowRadius: 5,
                                }}
                            >{linkedEvents?.length > 4 && index === 3 ? `${linkedEvents.length - 3} more` : event.name}
                            </TextComponent>

                            <TimestackMedia itemInView source={event.storageLocation} style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                opacity: 0.75,
                                zIndex: 1,
                            }} />


                        </View>
                    </TouchableOpacity>
                </View>
            }}
            keyExtractor={(item, index) => index.toString()}
        />

    </View > : null
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center"
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
});