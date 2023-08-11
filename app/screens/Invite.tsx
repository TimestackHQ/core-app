import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import axios from 'axios';
import HTTPClient from '../httpClient';
import { dateFormatter } from '../utils/time';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import TimestackMedia from '../Components/TimestackMedia';
const { width } = Dimensions.get('window');

import HapticFeedback from 'react-native-haptic-feedback';
import { AuthScreenNavigationProp, EventScreenNavigationProp } from '../navigation';

const hapticOptions = {
    enableVibrateFallback: true, // fallback to vibration if haptic feedback is not available
    ignoreAndroidSystemSettings: false, // respect Android system settings for haptic feedback
};

export default function Invite() {

    const route = useRoute<RouteProp<{
        params: {
            eventId: string
        }
    }>>();

    const navigation = useNavigation<
        AuthScreenNavigationProp |
        EventScreenNavigationProp
    >();

    const [event, setEvent] = useState<any>({});
    const [joined, setJoined] = useState<boolean>(false);

    useEffect(() => {
        new Promise(async (resolve, reject) => {
            HTTPClient("/auth/check", "GET")
                .then((_res) => {


                })
                .catch((err) => {
                    if (err.response.status === 401) {
                        console.log("Not authenticated, redirecting to auth screen");
                        navigation.navigate("Auth", {
                        });
                    }
                })
        }).then(_r => { });
    }, []);


    useEffect(() => {

        const eventId = route.params.eventId;


        HTTPClient('/events/' + eventId, 'GET')
            .then((response) => {
                setEvent(response.data.event);
                if (response.data.message === 'joinRequired') {
                    setJoined(false);
                }

            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const join = () => {

        const eventId = route.params.eventId;

        HTTPClient("/events/" + eventId + "/join", "POST")
            .then((response) => {
                setJoined(true);
                navigation.navigate("Event", {
                    eventId: eventId,
                    eventName: event.name,
                    refresh: true
                })
            })
            .catch((error) => {
                alert("Error joining event. Please try again later.");
            });
    }

    return <View style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            {event?.thumbnailUrl ? <TimestackMedia type={"image"} source={event?.storageLocation} style={{ width, height: "100%" }} /> : null}
        </View>
        <View style={{ flex: 1, zIndex: 1, position: "absolute", top: 0, width: "100%", height: "100%" }}>

            <View style={{
                width: "100%",
                flex: 3,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: "column",
            }}>
                <Text
                    style={{
                        width: "100%",
                        padding: 10,
                        fontFamily: "Athelas Bold",
                        fontSize: 50, color: "white",
                        marginTop: 10,
                        textAlign: "center",
                        letterSpacing: -2,
                        ...shadow(3)
                    }}
                >{event?.name}</Text>
                <Text
                    style={{
                        ...styles.text,
                        marginTop: 10,
                    }}>
                    {event?.location}
                </Text>
                <Text
                    style={styles.text}>
                    {dateFormatter(new Date(event?.startsAt))}
                </Text>
                {/* <TouchableOpacity onPress={() => {
                    // HapticFeedback.trigger('selection', hapticOptions);

                }}
                ><Text>Hey</Text></TouchableOpacity> */}
            </View>
            <View style={{ width: "100%", flex: 3, justifyContent: 'center', alignItems: 'flex-end', flexDirection: "row" }}>
                <View style={{ flex: 3, width: "100%", justifyContent: "center", alignItems: "flex-end" }}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                        style={{
                            width: 50,
                            backgroundColor: "#FF9B9B",
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            bottom: "10%",
                            borderRadius: 25,
                            marginRight: 10
                        }}>
                        <FastImage
                            source={require("../assets/icons/collection/x-black.png")}
                            style={{ width: 40, height: 40 }}
                        />


                    </TouchableOpacity>
                </View>
                <View style={{ flex: 5 }}>
                    <TouchableOpacity
                        onPress={join}
                        style={{
                            width: "100%",
                            backgroundColor: "black",
                            opacity: 0.8,
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            bottom: "10%",
                            borderRadius: 25,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "Red Hat Display Regular",
                                fontSize: 30, color: "white",
                                textAlign: "center",
                            }}
                        >JOIN</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 3 }}></View>
            </View>
        </View>
    </View>
}

const shadow = (radius: number) => ({
    shadowColor: "white",
    shadowOffset: {
        width: 0,
        height: 0
    },
    shadowOpacity: 1,
    shadowRadius: radius,
    textShadowColor: "white",
    textShadowOffset: {
        width: 0,
        height: 0
    },
});

const styles = StyleSheet.create({
    text: {
        width: "100%",
        fontFamily: "Red Hat Display Regular",
        fontSize: 18, color: "white",
        textAlign: "center",
        ...shadow(1)
    }
});