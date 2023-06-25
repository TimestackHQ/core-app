import * as React from "react";
import { useEffect } from "react";
import { Image, StatusBar, View, Text, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from 'expo-application';
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as Updates from "expo-updates";
import { NavigationContainer } from "@react-navigation/native";
import { OverflowMenuProvider } from "react-navigation-header-buttons";
import axios from 'axios';
import uploadWorker from "./uploadWorker";
import CoreNavigationStack from "./stacks/core";
import { frontendUrl } from "./utils/io";

uploadWorker();

export const setSession = async (session) => {
    console.log("SETTING SESSION");
    await AsyncStorage.setItem('@session', session);
}


function App() {


    const navigationContainerRef = React.useRef();

    const [loaded] = useFonts({
        'Athelas Bold': require('./assets/fonts/Athelas-Bold.ttf'),
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

    StatusBar.setBarStyle('dark-content', true);

    useEffect(() => {

        axios(frontendUrl + "/api/bundle").then((response) => {

            if (response.data.activeClients[Platform.OS].includes(Application.nativeApplicationVersion)) {
                console.log("Client is backwards compatible. Downloading and reloading Expo Update.");

            } else {
                setTimeout(() => {
                    const alert = () => {
                        Alert.alert(
                            "New update",
                            "We've released new features on Timestack. Make sure to update your app to get the latest updates.",
                            [
                                {
                                    text: "Update",
                                    onPress: async () => {
                                        Platform.OS === "ios" ? Linking.openURL("https://apps.apple.com/us/app/timestack/id1671064881") : Linking.openURL("https://play.google.com/store/apps/details?id=com.timestack.timestack");
                                        alert();
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                    alert();
                }, 1000);
            }

        });
    }, []);


    useEffect(() => {
        console.log(navigationContainerRef.current);
    }, [navigationContainerRef.current]);
    return loaded ?
        <NavigationContainer ref={navigationContainerRef}>
            <OverflowMenuProvider>
                <CoreNavigationStack />
            </OverflowMenuProvider>
        </NavigationContainer>
        : null;

}

export default App;