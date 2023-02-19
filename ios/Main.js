import * as React from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {SafeAreaView, View} from "react-native";
import * as Contacts from "expo-contacts";
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import {v4 as uuid} from "uuid";
import {useEffect, useId} from "react";
import Constants from "expo-constants";
import axios from "axios";

function ViewType ({children, type}) {
    if(type === "safe") {
        return <SafeAreaView  style={{flex: 1, flexDirection: 'row'}}>{children}</SafeAreaView>
    }
    return <View  style={{flex: 1, flexDirection: 'row'}}>{children}</View>
}


export default function Main({pickImage, apiUrl, frontendUrl, queueUpdated}) {

    const db = SQLite.openDatabase("media.local.db");

    const webviewRef = React.createRef();
    const [viewtype, setViewtype] = React.useState("safe");
    const [uri , setUri] = React.useState(frontendUrl+'/main_ios');

    useEffect(() => {
        setInterval(async () => {
            db.transaction(tx => {
                tx.executeSql(
                    "SELECT * FROM media",
                    [],
                    (_, { rows: { _array } }) => {
                        webviewRef.current?.postMessage(JSON.stringify({
                            response: "uploadQueue",
                            data: _array
                        }))
                    })
            })
        }, 1000);
    });


    return (
        <ViewType type={viewtype}>
            <WebView
                // style={{ resizeMode: 'cover', flex: 1 }}
                scalesPageToFit={false}
                allowsInlineMediaPlayback="true"
                allowsBackForwardNavigationGestures="true"
                source={{ uri: uri ? uri : frontendUrl+'/main_ios'}}
                injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                onNavigationStateChange={async (event) => {
                    console.log(event);
                   if(event.url.includes("/fullview") || event.url.includes("/auth")) {
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
                }}
                ref={webviewRef}
            />
        </ViewType>
    );
}



// media.transaction(tx => {
//     tx.executeSql(
//         "UPDATE media SET locker = ? WHERE id = ?",
//         [true, media.id]
//     );
// });
//
// const formData = new FormData();
// formData.append('metadata', JSON.stringify(media.metadata));
// formData.append('file', {uri: media.file, name: "name"});
// try {
//
//     const xhr = new XMLHttpRequest();
//     xhr.open('POST', "http://10.0.0.151:4000/v1/media/" + media.eventId);
//     xhr.setRequestHeader("authorization", "Bearer " + (await AsyncStorage.getItem("@session")));
//     xhr.send(formData);
//
//     media.transaction(tx => {
//         tx.executeSql(
//             "DELETE FROM media WHERE id = ?",
//             [media.id]
//         );
//     });
//
// } catch (err) {
//     console.log(err, "err")
//     media.transaction(tx => {
//         tx.executeSql(
//             "UPDATE media SET failed = ? WHERE id = ?",
//             [true, media.id]
//         );
//     });
// }



// useEffect(() => {
//
//     mediaDB.transaction(tx => {
//         tx.executeSql(
//             "CREATE TABLE IF NOT EXISTS media (id text primary key not null, eventId text, file text, locker boolean, failed boolean, metadata text);"
//         );
//     });
//     const worker = async () => {
//         mediaDB.transaction(tx => {
//             tx.executeSql(
//                 "SELECT * FROM media WHERE locker = ? AND failed = ?",
//                 [false, false],
//                 (_, { rows: { _array } }) => {
//                     console.log(_array)
//                     _array.map(async media => {
//                         mediaDB.transaction(tx => {
//                             tx.executeSql(
//                                 "UPDATE media SET locker = ? WHERE id = ?",
//                                 [true, media.id]
//                             );
//                         });
//                         const formData = new FormData();
//                         formData.append('metadata', JSON.stringify(media.metadata));
//                         formData.append('file', {uri: media.file, name: "name"});
//                         try {
//
//                             const upload = await axios.post(apiUrl+"/v1/media/" + media.eventId, formData, {
//                                 headers: {
//                                     authorization: "Bearer " + (await AsyncStorage.getItem("@session"))
//                                 }
//                             });
//
//
//                             webviewRef.current.postMessage(JSON.stringify({
//                                 response: "uploadMedia",
//                                 data: {
//                                     mediaId: upload.data.media.publicId,
//                                     eventId: media.eventId
//                                 }
//                             }));
//
//                             mediaDB.transaction(tx => {
//                                 tx.executeSql(
//                                     "DELETE FROM media WHERE id = ?",
//                                     [media.id]
//                                 );
//                             });
//                         } catch (err) {
//                             console.log(err, "err")
//                             mediaDB.transaction(tx => {
//                                 tx.executeSql(
//                                     "UPDATE media SET locker = ? AND failed = ? WHERE id = ?",
//                                     [false, true, media.id]
//                                 );
//                             });
//                         }
//                     })
//                 }
//             );
//         });
//         await new Promise(resolve => setTimeout(resolve, 5000));
//         worker();
//     }
//     worker();
// }, [])