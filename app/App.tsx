import * as React from "react";
import { useEffect } from "react";
import { StatusBar, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    QueryClient, QueryClientProvider
} from "react-query";
import * as Application from 'expo-application';
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import { OverflowMenuProvider } from "react-navigation-header-buttons";
import axios from 'axios';
import CoreNavigationStack from "./stacks/core";
import store from './store'
import { Provider } from 'react-redux'
import { frontendUrl } from "./utils/io";
import {QueueContext, useQueue, useQueueCounter} from "./hooks/queue";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ActionSheetProvider} from "@expo/react-native-action-sheet";


export const setSession = async (session) => {
    console.log("SETTING SESSION");
    await AsyncStorage.setItem('@session', session);
}

const queryClient = new QueryClient();

function App() {

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
        'Red Hat Display Semi Bold Italic': require('./assets/fonts/RedHatDisplay-SemiBoldItalic.ttf')
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

    const queueCounter = useQueueCounter();
    const queue = useQueue();


    return loaded ?
        <Provider store={store}>
            <QueueContext.Provider value={[queueCounter, queue]}>
                <QueryClientProvider client={queryClient}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <ActionSheetProvider>
                            <NavigationContainer>
                                <OverflowMenuProvider>
                                    <CoreNavigationStack />
                                </OverflowMenuProvider>
                            </NavigationContainer>
                        </ActionSheetProvider>
                    </GestureHandlerRootView>
                </QueryClientProvider>
            </QueueContext.Provider>

        </Provider>

        : null;

}

export default App;