import * as React from 'react';
import Main from "./Main";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as _ from "lodash";
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import uuid from 'react-native-uuid';
import {generateScreenshot, processPhoto, processVideo} from "./utils/compression";
import * as SQLite from "expo-sqlite";
import DBWorker from "./dbWorker";
import {useEffect} from "react";



export default function App() {

    const db = SQLite.openDatabase("media.local.db");
    DBWorker(db);

    useEffect(() => {
        console.log("DB", db)
    }, [])

    const apiUrl = Constants.expoConfig.extra.apiUrl;
    const frontendUrl = Constants.expoConfig.extra.frontendUrl;

    const [queue, setQueue] = React.useState([]);

    const pickImage = async (eventId, webviewRef) => {

        try {



            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                exif: true,
                quality: 0,
            });




            if (!result.canceled) {
                console.log("UPLOADING", result.assets.map(media => media.uri), "result")


                for await (const media of _.uniq(result.assets)) {

                    db.transaction(tx => {
                        tx.executeSql(
                            "INSERT INTO media (media, eventId, failedCounter, locker) VALUES (?, ?, ?, ?)",
                            [JSON.stringify({
                                ...media,
                                eventId
                            }), eventId, 0, false],
                            () => {
                                console.log("INSERTED", media.uri, "media")
                            },
                            (_, error) => {
                                console.log(error, "error")
                            }
                        );
                    });

                }

                webviewRef.current.postMessage(JSON.stringify({
                    response: "uploadStatus",
                    data: "import",
                    eventId
                }));

                webviewRef.current.postMessage(JSON.stringify({
                    response: "uploadStatus",
                    data: "upload",
                    eventId
                }));
                //
                // webviewRef?.current?.postMessage(JSON.stringify({
                //     response: "uploadMediaDone",
                //     data: {
                //         eventId: eventId
                //     }
                // }));

            }

            webviewRef.current.postMessage(JSON.stringify({
                response: "uploadStatus",
                data: "complete",
                eventId
            }));


        }catch(err) {
            console.log(err, "err")
        }
    };

    // useEffect(() => {
    //     // get all media from db
    //     setInterval(() => {
    //         db.transaction(tx => {
    //             tx.executeSql(
    //                 "SELECT * FROM media",
    //                 [],
    //                 (_, { rows: { _array } }) => {
    //                     console.log("Sending upload queue", _array);
    //                     setQueue(_array);
    //                 },
    //                 () => {}
    //             );
    //         });
    //     }, 1000);
    //
    // }, []);


    return (
        <React.Fragment>
            <Main
                pickImage={pickImage}
                apiUrl={apiUrl}
                frontendUrl={frontendUrl}
                queueUpdated={queue}
            />
        </React.Fragment>
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
