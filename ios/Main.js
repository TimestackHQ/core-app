import * as React from 'react';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';
import {SafeAreaView, Share, View} from "react-native";
import * as Contacts from "expo-contacts";
import * as SQLite from 'expo-sqlite';
import ExpoJobQueue from "expo-job-queue";
import {useEffect} from "react";

let mediaWatcher = null;


function ViewType ({children, type, webviewRef}) {


    if(type === "safe") {
        return <SafeAreaView  style={{flex: 1, flexDirection: 'row'}}>{children}</SafeAreaView>
    }
    return <View  style={{flex: 1, flexDirection: 'row'}}>{children}</View>
}


export default function Main({pickImage, frontendUrl, queueUpdated}) {

    const url = Linking.useURL();


    const webviewRef = React.createRef();
    const [viewtype, setViewtype] = React.useState("safe");
    const [uri , setUri] = React.useState(frontendUrl+'/main_ios');

    useEffect(() => {
        console.log("URL:", url);
        if(url) {
            setUri(url.replace("timestack://", frontendUrl+"/"));
        }
    }, [url]);


    return (
        <ViewType webviewRef={webviewRef} type={viewtype}>
            <WebView
                scalesPageToFit={false}
                allowsInlineMediaPlayback="true"
                allowsBackForwardNavigationGestures="true"
                source={{ uri: uri ? uri : frontendUrl+'/main_ios'}}
                injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                onNavigationStateChange={async (event) => {
                    console.log(event);
                   if(event.url.endsWith("/join") || event.url.includes("/auth")) {
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
                }}
                ref={webviewRef}
            />
        </ViewType>
    );
}