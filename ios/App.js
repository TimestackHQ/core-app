import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Image, StatusBar, View, Text, Platform, Alert} from "react-native";
import {NavigationContainer, useNavigation, useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpoJobQueue from "expo-job-queue";
import * as TimestackCoreModule from './modules/timestack-core';
import {useFonts} from "expo-font";
import Constants from "expo-constants";
import uploadWorker from "./uploadWorker";
import Main from "./Main";
import {useEffect, useState} from "react";
import HTTPClient from "./httpClient";
import {
    AddStackScreen,
    FutureStackScreen,
    HomeStackScreen,
    NotificationsStackScreen,
    ProfileStackScreen
} from "./stacks";
import * as React from "react";
import * as Linking from "expo-linking";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";
import {OverflowMenuProvider} from "react-navigation-header-buttons";
import axios from 'axios';
// import * as Sentry from "@sentry/react-native";

const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;

uploadWorker();
const setSession = async (session) => {
    console.log("SETTING SESSION");
    await AsyncStorage.setItem('@session', session);

}

function Viewer({baseRoute, navigation}) {
    return (
        <Main
            baseRoute={baseRoute}
            apiUrl={apiUrl}
            navigation={navigation}
            frontendUrl={frontendUrl}
        />
    );
}

function Invite ({navigation, route}) {
    return <Viewer navigation={navigation} baseRoute={route.params?.url ? route.params?.url : "/event/"+route.params.eventId+"/join"}/>
}

function AuthScreen({navigation, route}) {

    return <Main
            baseRoute={"/auth"}
            apiUrl={apiUrl}
            frontendUrl={frontendUrl}
            setSession={setSession}
            navigation={navigation}
        />;
}

function ErrorScreen() {

    return <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <Image
            style={{
                width: 300,
            }}
            source={require("./assets/i-thought-we-had-a-connection-connection.gif")}
        />
        <Text style={{
            marginTop: 40,
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 25,
            color: "gray"
        }}>
            Can’t connect
        </Text>
        <Text style={{
            textAlign: 'center',
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 20,
            color: "gray"
        }}>
            Make sure you are connected to the internet.
        </Text>
    </View>
}

function App() {

    axios(frontendUrl+"/api/bundle").then((response) => {
        let NativeClientVersion = "";
        try {
            NativeClientVersion = TimestackCoreModule.NativeClientVersion ? TimestackCoreModule.NativeClientVersion : "";
        } catch (e) {
            console.log(e);
        }

        console.log("NativeClientVersion", NativeClientVersion);

        if(response.data.clientVersion[Platform.OS] !== NativeClientVersion) {
            console.log("Bundle version mismatch. Current version: "+NativeClientVersion+". Server version: "+response.data.clientVersion[Platform.OS]);

            if(response.data.backwardsCompatibleClients[Platform.OS].includes(NativeClientVersion)) {
                console.log("Client is backwards compatible. Downloading and reloading Expo Update.");
                Updates.fetchUpdateAsync().then(() => {
                    Updates.reloadAsync();
                });
            } else {
                setTimeout(() => {
                    Alert.alert(
                        "New update",
                        "We've released new features on Timestack. Make sure to update your app to get the latest updates.",
                        [
                            {
                                text: "Update",
                                onPress: async () => {
                                    await AsyncStorage.setItem("@update5", "true");	
                                    Platform.OS === "ios" ? Linking.openURL("https://apps.apple.com/us/app/timestack/id1671064881") : Linking.openURL("https://play.google.com/store/apps/details?id=com.timestack.timestack");
                                    Updates.reloadAsync();
                                }
                            }
                        ],
                        {cancelable: false}
                    );
                }, 1000);
            }
                    
            Updates.reloadAsync();
        }
    });
    
    Updates.checkForUpdateAsync().then(async (update) => {
        if(update.isAvailable) {
            await Updates.fetchUpdateAsync();
            Updates.reloadAsync();
        }
    })
    .catch((e) => {
        console.log(e);
    });


    const [loaded, error] = useFonts({
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

    return loaded ?
        <NavigationContainer>
            <OverflowMenuProvider>
                <CoreStackScreen/>
            </OverflowMenuProvider>
        </NavigationContainer>
    : null;

}

const CoreStack = createNativeStackNavigator();
function CoreStackScreen() {

    const navigator = useNavigation();

    const urlSource = Linking.useURL();
    const [authenticated, setAuthenticated] = useState(true);
    const [currentSession, setCurrentSession] = useState(null);

    const urlListenerWorker = url => {
        console.log("URL deeplink intercepted, navigating to: "+url);
        const path = url.replace("timestack://", "");
        console.log(path);
        if(path.startsWith("event/")) {
            navigator.navigate("Invite", {
                eventId: path.split("/")[1]
            });
        }
    }

    useEffect(() => {
        console.log("Here", urlSource);
        if(urlSource) {
            urlListenerWorker(urlSource);
        }

    }, [urlSource]);



    useEffect(() => {
        new Promise(async (resolve, reject) => {
            HTTPClient("/auth/check", "GET")
                .then((_res) => {

                    setAuthenticated(true);

                })
                .catch((err) => {
                    if(err.response.status === 401) {
                        console.log("Not authenticated, redirecting to auth screen");
                        navigator.navigate("Auth", {
                            redirect: urlSource
                        });
                    }
                })
        }).then(_r => {});

        // push notifications reader
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {

            console.log("received notification response");

            // processed notification link
            const notification = response.notification.request.content;
            const url = notification?.data.payload?.url;
            if(url) {

                navigator.navigate("NotificationsStack", {
                    screen: "Notifications",
                });
            };

        });


        return () => {
            subscription.remove();
            // clearInterval(network);
        }
    }, [currentSession]);

    return (
        <CoreStack.Navigator screenOptions={{
            headerShown: false,
            animationEnabled: false,
            gestureEnabled: false
        }}>
            <CoreStack.Screen name="Main" component={Nav} />
            <CoreStack.Screen name="Auth" navigationOptions={{
                animationEnabled: false
            }} component={AuthScreen} />
            <CoreStack.Screen name="Invite" navigationOptions={{
                animationEnabled: false
            }} component={Invite} />
            <CoreStack.Screen
                options={{presentation: "formSheet"}}
                name="Error" component={ErrorScreen}
            />
            {/*<CoreStack.Screen options={{*/}
            {/*    presentation: "card",*/}
            {/*    animationTypeForReplace: "pop",*/}
            {/*    gestureEnabled: true,*/}
            {/*    gestureDirection: "vertical",*/}
            {/*    animationEnabled: true,*/}
            {/*}} name="MediaView" component={MediaView} />*/}

        </CoreStack.Navigator>
    );
}


const Tab = createBottomTabNavigator();
function Nav() {

    ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

    return (
        <Tab.Navigator
            screenOptions={{
                showLabel: false,
                headerShown: false,
                tabBarStyle: {
                    padding: 20, // Increase the vertical margin of the tab bar,
                    borderWidth: 0,
                    margin: 0
                },
            }}
        >
            <Tab.Screen
                name="HomeStack"
                component={HomeStackScreen}
                screenOptions={{
                }}
                options={{
                    style: {
                        marginVertical: 10, // Increase the vertical margin of the tab bar
                    },
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/home_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/home_white.png")}/>
                    }
                }}
            />
            <Tab.Screen
                name="EventsStack"
                component={FutureStackScreen}
                c
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/future_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/future_white.png")}/>

                    }
                }}
            />

            <Tab.Screen
                name="AddStack"
                component={AddStackScreen}
                // options={(tab)=> {
                //     console.log(tab);
                //     const navigation = tab.navigation;
                //     return ({
                //         tabBarButton:props => <TouchableOpacity style={{backgroundColor: "red"}} {...props} onPress={()=>navigation.navigate('SignIn')}>
                //             <Image style={{width: 40, height: 40, marginTop: 10}} source={require("./assets/icons/nav/add_white.png")}/>
                //         </TouchableOpacity>,
                //         tabBarLabel: '',
                //     })
                // }}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width:40, height: 40}} source={require("./assets/icons/collection/timestack.png")}/>
                        return <Image style={{width: 40, height: 40}} source={require("./assets/icons/collection/timestack.png")}/>

                    }
                }}
            />
            <Tab.Screen
                name="NotificationsStack"
                component={NotificationsStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/notifications_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/notifications_white.png")}/>

                    }
                }}
            />
            <Tab.Screen
                name="ProfileStack"
                component={ProfileStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/profile_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/profile_white.png")}/>

                    }
                }}
            />

        </Tab.Navigator>


    );
}



export default App;
// export default Sentry.wrap(App);