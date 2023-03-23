import * as React from 'react';
import { WebView } from 'react-native-webview';
import { NativeModules } from "react-native";

import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';
import {SafeAreaView, Share, TouchableOpacity, View, Text, StatusBar} from "react-native";
import * as Contacts from "expo-contacts";
import ExpoJobQueue from "expo-job-queue";
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


export default function Main({baseRoute, frontendUrl, queueUpdated, navigation}) {

    const url = Linking.useURL();

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    console.log(frontendUrl+baseRoute);

    useEffect(() => {
        webviewRef.current.reload();
    }, [baseRoute]);


    const webviewRef = React.createRef();
    const modalRef = React.createRef();
    const [viewtype, setViewtype] = React.useState("safe");
    const [uri , setUri] = React.useState(null);
    const [barStyle, setBarStyle] = React.useState("light-content");
    const [modalData, setModalData] = React.useState({
        type: null,
        payload: null
    });

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if(!token) {
                setExpoPushToken("ExponentPushToken[HaK7a_IDmPDQz4DkTJo4U6]");
            }
            setExpoPushToken(token)
        });

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {

            console.log("received notification response");

            // processed notification link
            const notification = response.notification.request.content;
            const url = notification?.data.payload?.url;
            if(url) setUri(url);

            //updates webview child
            webviewRef.current.postMessage(JSON.stringify({
                response: "notificationsCount",
            }));
        });

        return () => subscription.remove();

    }, []);

    useEffect(() => {
       setTimeout(() => {

           console.log("URL:", url);
           if(url) {
               setUri(url.replace("timestack://", frontendUrl+"/"));
           }
       }, 500);
    }, [url]);

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
        updatePushToken()
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
                allowsInlineMediaPlayback="true"
                // allowsBackForwardNavigationGestures="true"
                source={{ uri: uri ? uri : frontendUrl+baseRoute}}
                injectedJavaScript={`window.localStorage.setItem("appVersion", "0.0.15-1");const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                onNavigationStateChange={async (event) => {
                    console.log(event);
                   if(event.url.includes("/join") || event.url.includes("/auth")) {
                       setUri(event.url);

                       setViewtype("full");
                   } else {
                        setUri(event.url);
                      setViewtype("safe");
                   }
                }}
                onMessage={async (event) => {

                    const message = JSON.parse(event.nativeEvent.data);

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

                    if(message.request === "allContacts"){
                        console.log("Providing all contacts")
                        const { status } = await Contacts.requestPermissionsAsync();
                        if (status === 'granted') {

                            const { data } = await Contacts.getContactsAsync({
                            });
                            webviewRef.current.postMessage(JSON.stringify({
                                response: "allContacts",
                                data
                            }));

                        }
                    }

                    if(message.request === "session") {

                        console.log(message)
                        console.log("========> Setting session");
                        await AsyncStorage.setItem("@session", message.session);

                        updatePushToken();
                    }

                    if(message.request === "uploadQueue") {
                        console.log("Sending back queue");
                        webviewRef.current?.postMessage(JSON.stringify({
                            response: "uploadQueue",
                            data: (await ExpoJobQueue.getJobs()).map(job => JSON.parse(job.payload))
                        }));
                    }

                    if(message.request === "shareLink") {
                        console.log("Sharing link", message.link);
                        await Share.share({
                            url: message.link,
                            title: message.link
                        });
                    }

                    if(message.request === "openLink") {
                        console.log("Opening link", message.link);
                        await WebBrowser.openBrowserAsync(message.link)
                    }

                    if(message.request === "pushNotifications") {
                        let { status } = await askAsync(Permissions.NOTIFICATIONS);

                        if (status !== PermissionStatus.GRANTED) {
                            return;
                        }

                        let token = await Notifications.getExpoPushTokenAsync();
                        console.log(token);
                    }

                    if(message.request === "eventButtonAction") {
                        await AsyncStorage.setItem("@eventButtonAction", message.eventId);
                    }


                }}
                ref={webviewRef}
            />
        </View>
    );
}