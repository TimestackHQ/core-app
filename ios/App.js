import * as React from 'react';
import Main from "./Main";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import uploadWorker from "./uploadWorker";
import {useEffect} from "react";

const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;

uploadWorker();

let mediaWatcher = null;

export default function App() {

    ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

    const pickImage = async (eventId, webviewRef) => {

        try {

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                exif: true,
                quality: 0,
            });

            if (!result.canceled) {

                webviewRef.current.postMessage(JSON.stringify({
                    response: "uploadStatus",
                    data: "import",
                    eventId
                }));

                for await (const media of _.uniq(result.assets)) {

                    ExpoJobQueue.addJob("mediaQueue", {
                        ...media,
                        eventId
                    })

                }

                ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

                webviewRef.current.postMessage(JSON.stringify({
                    response: "uploadStatus",
                    data: "upload",
                    eventId
                }));

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

