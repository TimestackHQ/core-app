import * as React from 'react';
import { WebView } from 'react-native-webview';
import {Alert, Image} from "react-native";
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';
import {TouchableOpacity, View, Text, StatusBar} from "react-native";
import {useEffect, useRef, useState} from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import HTTPClient from "./httpClient";
import axios from "axios";
import Constants from "expo-constants";
import { ModalView } from 'react-native-ios-modal';
import Upload from "./screens/Upload";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        // alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}


export default function Main({baseRoute, frontendUrl, navigation}) {

    const [expoPushToken, setExpoPushToken] = useState('');

    console.log(frontendUrl+baseRoute);

    useEffect(() => {
        console.log(baseRoute)
        webviewRef.current?.reload();
    }, [baseRoute]);


    const webviewRef = React.createRef();
    const modalRef = React.createRef();
    const [viewtype, setViewtype] = React.useState("safe");
    const [uri , setUri] = React.useState(null);
    const [modalData, setModalData] = React.useState({
        type: null,
        payload: null
    });
    const [session, setSession] = React.useState(null);

    useEffect(() => {
        const getAsyncStorage = async () => {
            const session = await AsyncStorage.getItem("@session");
            setSession(session);
        }
        getAsyncStorage();
        try {
            registerForPushNotificationsAsync().then(token => {
                if(!token) {
                    setExpoPushToken("ExponentPushToken[HaK7a_IDmPDQz4DkTJo4U6]");
                }
                setExpoPushToken(token)
            }).catch(err => {
                console.log(err);
            })
        } catch (e) {
            console.log(e);
        }


    }, []);


    const updatePushToken = async () => {

        const apiUrl = Constants.expoConfig.extra.apiUrl;

        if(expoPushToken) axios({
            url: apiUrl + "/v1/auth/notifications/link",
            method: "POST",
            headers: {
                authorization: "Bearer " + (await AsyncStorage.getItem("@session"))
            },
            data: {
                pushToken: expoPushToken
            }
        }).then(res => {
            console.log("Push token updated");
        }).catch(err => {
            console.log("Push token update failed");
            console.log(err.response.data)
        });
    }

    useEffect(() => {
        updatePushToken();
    }, [expoPushToken, ]);


    return (
        <View style={{flex: 1, flexDirection: 'row', flexGrow: 1}}>

            <ModalView onModalWillDismiss={() => {
                webviewRef.current.postMessage(JSON.stringify({
                    response: "modalDismissed",
                }))}
            } ref={modalRef}>

                {modalData.type === "upload" ? <Upload payload={modalData.payload}/> : null}

            </ModalView>
            {/*<StatusBar*/}
            {/*    backgroundColor="back"*/}
            {/*    barStyle="light-content"*/}
            {/*/>*/}
            <WebView
                scalesPageToFit={false}
                renderError={() => {
                    return <ViewError webviewRef={webviewRef}/>;
                }}
                allowsInlineMediaPlayback="true"
                // allowsBackForwardNavigationGestures="true"
                source={{ uri: uri ? uri : frontendUrl+baseRoute }}
                // injectedJavaScript={`window.localStorage.setItem("TIMESTACK_TOKEN", "${session}");window.localStorage.setItem("appVersion", "0.0.15-1");const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                injectedJavaScript={`window.localStorage.setItem("appVersion", "0.0.15-1");const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                onNavigationStateChange={async (event) => {
                    setUri(event.url);
                }}
                onMessage={async (event) => {

                    const message = JSON.parse(event.nativeEvent.data);

                    console.log(message);
                    if(message.request === "modalView") {

                        setModalData({
                            type: message.type,
                            payload: message.payload
                        });

                        modalRef.current.setVisibility(true);

                    }

                    if(message.request === "navigate") {
                        console.log(message);
                        if(navigation) {
                            navigation.navigate(message.payload[0], message.payload[1]);
                        }
                    }

                    if(message.request === "navigateBack") {
                        console.log(message);
                        if(navigation) {
                            navigation.goBack();
                        }
                    }

                    if(message.request === "resetStack") {
                        console.log(message);
                        if(navigation) {
                            navigation.replace(
                                'Main', // same screen
                                null, // no params
                                null, // no "sub-action"
                                // key for new screen. i just use a random number but you could
                                // generate a uuid or whatever
                                Math.random().toString()
                            );
                        }
                    }


                    if(message.request === "session") {

                        console.log(message)
                        console.log("========> Setting session");
                        await AsyncStorage.setItem("@session", message.session);

                        updatePushToken();
                    }


                    if(message.request === "openLink") {
                        console.log("Opening link", message.link);
                        await WebBrowser.openBrowserAsync(message.link)
                    }

                    if(message.request === "openNativeLink") {
                        console.log("Opening native link", message.link);
                        await Linking.openURL(message.link)
                    }


                    if(message.request === "eventButtonAction") {
                        await AsyncStorage.setItem("@eventButtonAction", message.eventId);
                    }

                    if(message.request === "cancelEventInvite") {
                        Alert.alert("Decline Invite", "Are you sure you want to decline this invite?", [
                            {
                                text: "Cancel",
                                style: "cancel"
                            },
                            {
                                text: "Yes",
                                onPress: async () => {
                                    HTTPClient("/events/"+message.eventId+"/leave", "POST")
                                        .then((response) => {
                                            navigation.navigate("Main", {
                                                updatedId: Math.random().toString(36).substring(7)
                                            });
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Main' }],
                                            });
                                        })
                                        .catch((error) => {
                                            Alert.alert("Error", "Could not leave event", [
                                                {
                                                    text: "OK",

                                                }
                                            ])
                                            // window.location.href = "/main_ios";
                                        });


                                }
                            }
                        ])

                    }

                    if(message.request === "clearSession") {
                        console.log("Clearing session");
                        await AsyncStorage.removeItem("@session");
                    }


                }}
                ref={webviewRef}
            />
        </View>
    );
}

function ViewError ({webviewRef}) {
    return <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white"
    }}>
        <Image
            style={{
                width: 300,marginTop: -400
            }}
            source={require("./assets/i-thought-we-had-a-connection-connection.gif")}
        />
        <Text style={{
            marginTop: 40,
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 25,
            color: "gray"
        }}>
            Can’t connect.
        </Text>
        <Text style={{
            textAlign: 'center',
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 20,
            color: "gray"
        }}>
            Make sure you are connected to the internet.
        </Text>
        <TouchableOpacity style={{
            textAlign: "center",
            color: "grey",
            position: "absolute",
            bottom: 0,
            marginTop: 10,

            marginRight: 0,
            width: "90%",
            height: 50,
            backgroundColor: "black",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 35,
            marginBottom: 20,
            paddingRight: 0,
            zIndex: 1020
        }}

        >
            <Text
                onPress={() => {
                    webviewRef.current.reload();
                }}
                style={{
                fontFamily: "Red Hat Display Semi Bold",
                color: "white",
                fontSize: 20,
                textShadowColor: '#FFF',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 10,
            }}>RECONNECT</Text>
        </TouchableOpacity>
    </View>
}