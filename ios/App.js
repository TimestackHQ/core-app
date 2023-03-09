import * as React from 'react';
import { Navigation } from "react-native-navigation";
import Main from "./Main";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as _ from "lodash";
import ExpoJobQueue from "expo-job-queue";
import uploadWorker from "./uploadWorker";
import { useFonts } from 'expo-font';


const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;

uploadWorker();



export default function App() {

    ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

    const [fontsLoaded] = useFonts({
        'Red Hat Display Black': require('./assets/fonts/RedHatDisplay-Black.ttf'),
        'Red Hat Display Black Italic': require('./assets/fonts/RedHatDisplay-BlackItalic.ttf'),
        'Red Hat Display Bold': require('./assets/fonts/RedHatDisplay-Bold.ttf'),
        'Red Hat Display Bold Italic': require('./assets/fonts/RedHatDisplay-BoldItalic.ttf'),
        'Red Hat Display Italic': require('./assets/fonts/RedHatDisplay-Italic.ttf'),
        'Red Hat Display Medium': require('./assets/fonts/RedHatDisplay-Medium.ttf'),
        'Red Hat Display Medium Italic': require('./assets/fonts/RedHatDisplay-MediumItalic.ttf'),
        'Red Hat Display Regular': require('./assets/fonts/RedHatDisplay-Regular.ttf'),
        'Red Hat Display Semi Bold': require('./assets/fonts/RedHatDisplay-SemiBold.ttf'),
        'Red Hat Display Semi Bold Italic': require('./assets/fonts/RedHatDisplay-SemiBoldItalic.ttf'),


    });



    return (
        <React.Fragment>
            <Main
                apiUrl={apiUrl}
                frontendUrl={frontendUrl}
            />
        </React.Fragment>
    );

}

