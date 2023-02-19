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


export default function App() {

    const apiUrl = Constants.expoConfig.extra.apiUrl;
    const frontendUrl = Constants.expoConfig.extra.frontendUrl;

    const pickImage = async (eventId, webviewRef) => {

        try {

            webviewRef.current.postMessage(JSON.stringify({
                response: "uploadStatus",
                data: "import",
                eventId
            }));

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                exif: true,
                quality: 0,
            });

            webviewRef.current.postMessage(JSON.stringify({
                response: "uploadStatus",
                data: "upload",
                eventId
            }));


            if (!result.canceled) {
                console.log("UPLOADING", result.assets.map(media => media.uri), "result")
                for await (const media of _.uniq(result.assets)) {

                    const mediaId = uuid.v4();

                    const mediaList = [];

                    if(media.type === "video") {
                        const videoPath = await processVideo(mediaId, media.uri, 30, 10, 1080);
                        const thumbnailPath = await processVideo(mediaId+".thumbnail", media.uri, 15, 25, 600, 10);
                        const snapshotPath = await generateScreenshot(mediaId, media.uri);
                        mediaList.push(videoPath, thumbnailPath, snapshotPath);
                    }

                    else {
                        const imagePath = await processPhoto(mediaId, media.uri, 10);
                        const thumbnailPath = await processPhoto(mediaId+".thumbnail", media.uri, 41);
                        mediaList.push(imagePath, thumbnailPath);
                    }


                    try {

                        const formData = new FormData();
                        formData.append('metadata', JSON.stringify(media.exif));
                        formData.append('media', {uri: mediaList[0], name: mediaList[0].split("/").pop()});
                        formData.append('thumbnail', {uri: mediaList[1], name: mediaList[1].split("/").pop()});
                        if(media.type === "video") {
                            formData.append('snapshot', {uri: mediaList[2], name: mediaList[2].split("/").pop()});
                        }

                        console.log("UPLOADING", "result")

                        const upload = await axios.post(apiUrl+"/v1/media/" + eventId, formData, {
                            headers: {
                                authorization: "Bearer " + (await AsyncStorage.getItem("@session"))
                            }
                        });

                        webviewRef?.current?.postMessage(JSON.stringify({
                            response: "uploadMedia",
                            data: {
                                mediaId: upload.data.media.publicId,
                                eventId: eventId
                            }
                        }));

                    } catch (err) {
                        console.log(err, "err")
                    }
                }
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


    return (
        <React.Fragment>
            <Main
                pickImage={pickImage}
                apiUrl={apiUrl}
                frontendUrl={frontendUrl}
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
