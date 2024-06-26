import * as React from 'react';
import { WebView } from 'react-native-webview';
import {Image} from "react-native";
import {TouchableOpacity, View, Text} from "react-native";
import {useEffect} from "react";
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from "@react-native-async-storage/async-storage";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});



export default function Main({baseRoute, frontendUrl, navigation, session}) {

    console.log(frontendUrl+baseRoute);

    useEffect(() => {
        console.log(baseRoute)
        // @ts-ignore
        webviewRef.current?.reload();
    }, [baseRoute]);

    const webviewRef = React.createRef();
    const [uri , setUri] = React.useState(null);


    return (
        <View style={{flex: 1, flexDirection: 'row', flexGrow: 1}}>
            <WebView
                pullToRefreshEnabled
                scalesPageToFit={false}
                renderError={() => {
                    return <ViewError webviewRef={webviewRef}/>;
                }}

                source={{ uri: uri ? uri : frontendUrl+baseRoute }}
                injectedJavaScript={`window.localStorage.setItem("TIMESTACK_TOKEN", "${session}");window.localStorage.setItem("appVersion", "0.0.15-1"); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                onNavigationStateChange={async (event) => {
                    setUri(event.url);
                }}
                onMessage={async (event) => {

                    const message = JSON.parse(event.nativeEvent.data);

                    if(message.request === "navigate") {
                        console.log(message);
                        if(navigation) {
                            navigation.navigate(message.payload[0], message.payload[1]);
                        }
                    }

                    if(message.request === "openLink") {
                        console.log("Opening link", message.link);
                        await WebBrowser.openBrowserAsync(message.link)
                    }

                    if(message.request === "clearSession") {
                        console.log("Clearing session");
                        await AsyncStorage.removeItem("@session");
                    }



                }}
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