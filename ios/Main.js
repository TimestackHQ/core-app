import * as React from 'react';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';
import {SafeAreaView, Share, View} from "react-native";
import * as Contacts from "expo-contacts";
import ExpoJobQueue from "expo-job-queue";
import {useEffect, useRef, useState} from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import HTTPClient from "./httpClient";
import axios from "axios";
import Constants from "expo-constants";

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


export default function Main({pickImage, frontendUrl, queueUpdated}) {

    const url = Linking.useURL();

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();



    const webviewRef = React.createRef();
    const [viewtype, setViewtype] = React.useState("safe");
    const [uri , setUri] = React.useState(frontendUrl+'/main_ios');

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
        <View style={{flex: 1, flexDirection: 'row'}}>
            <WebView
                scalesPageToFit={false}
                allowsInlineMediaPlayback="true"
                // allowsBackForwardNavigationGestures="true"
                source={{ uri: uri ? uri : frontendUrl+'/main_ios'}}
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

                    if(message.request === "uploadMedia") {
                        await pickImage(message.eventId, webviewRef);
                    }

                    if(message.request === "session") {
                        console.log("Setting session");
                        await AsyncStorage.setItem('@session', message.session);
                        updatePushToken();
                    }

                    if(message.request === "uploadQueue") {
                        console.log("Sending back queue");
                        webviewRef.current.postMessage(JSON.stringify({
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


                }}
                ref={webviewRef}
            />
        </View>
    );
}