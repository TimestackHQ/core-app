import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Image} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ExpoJobQueue from "expo-job-queue";
import {useFonts} from "expo-font";
import Constants from "expo-constants";
import Updates from "react-native/Libraries/Utilities/DevSettings";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import uploadWorker from "./uploadWorker";
import Main from "./Main";
import {useEffect, useState} from "react";
import HTTPClient from "./httpClient";
import HomeStackScreen from "./stacks/HomeStack";

const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;

uploadWorker();

function Viewer({baseRoute}) {
        return (
            <Main
                baseRoute={baseRoute}
                apiUrl={apiUrl}
                frontendUrl={frontendUrl}
            />
        );
}

function Invite ({navigation, route}) {
    return <Viewer baseRoute={"/event/"+route.params.eventId+"/join"}/>
}
export default function App() {

    const [authenticated, setAuthenticated] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);

    useEffect(() => {
        new Promise(async (resolve, reject) => {
            const session = AsyncStorage.getItem("@session");
            HTTPClient("/auth/check", "GET")
                .then((_res) => {

                    setAuthenticated(true);

                })
        }).then(_r => {});
    }, [currentSession]);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         const session = AsyncStorage.getItem("@session");
    //         console.log(session?._z, currentSession?._z);
    //         if(session?._z != currentSession?._z) {
    //             setCurrentSession(session);
    //         }
    //     }, 100);
    //     return () => clearInterval(timer);
    // })

    const setSession = async (session) => {
        console.log("SETTING SESSION");
        await AsyncStorage.setItem('@session', session);
        setCurrentSession(session);
        Updates.reload();
    }

    return authenticated ? (
        <NavigationContainer><CoreStackScreen/></NavigationContainer>
    ) : <Main
        baseRoute={"/auth"}
        apiUrl={apiUrl}
        frontendUrl={frontendUrl}
        setSession={setSession}
    />;
}

const CoreStack = createNativeStackNavigator();
function CoreStackScreen() {
    return (
        <CoreStack.Navigator screenOptions={{
            headerShown: false
        }}>
            <CoreStack.Screen name="Main" component={Nav} />
            <CoreStack.Screen name="Invite" component={Invite} />
        </CoreStack.Navigator>
    );
}


const Tab = createBottomTabNavigator();
function Nav() {

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
        <Tab.Navigator
            screenOptions={{
                showLabel: false,
                headerShown: false,
                tabBarStyle: {
                    padding: 20, // Increase the vertical margin of the tab bar,
                    borderWidth: 0,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackScreen}
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
                name="Events"
                component={FutureScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/future_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/future_white.png")}/>

                    }
                }}
            />

            <Tab.Screen
                name="Add"
                component={AddScreen}
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
                        if(focused) return <Image style={{width: 40, height: 40}} source={require("./assets/icons/nav/add_black.png")}/>
                        return <Image style={{width: 40, height: 40}} source={require("./assets/icons/nav/add_white.png")}/>

                    }
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if(focused) return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/notifications_black.png")}/>
                        return <Image style={{width: 30, height: 30}} source={require("./assets/icons/nav/notifications_white.png")}/>

                    }
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
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


function FutureScreen() {
    return <Viewer baseRoute={"/main_ios"}/>
}

function AddScreen() {
    return <Viewer baseRoute={"/new"}/>
}

function NotificationsScreen() {
    return <Viewer baseRoute={"/notifications"}/>
}

function ProfileScreen() {
    return <Viewer baseRoute={"/profile"}/>
}