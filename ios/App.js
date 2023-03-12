import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Image, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";

import ExpoJobQueue from "expo-job-queue";
import {useFonts} from "expo-font";
import Constants from "expo-constants";
import uploadWorker from "./uploadWorker";
import Main from "./Main";

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

function HomeScreen() {
    return <Viewer baseRoute={"/main_ios"}/>
}

function FutureScreen() {
    return <Viewer baseRoute={"/main_ios"}/>
}

function AddScreen() {
    return <Viewer baseRoute={"/main_ios"}/>
}

function NotificationsScreen() {
    return <Viewer baseRoute={"/notifications"}/>
}

function ProfileScreen() {
    return <Viewer baseRoute={"/profile"}/>
}

export default function App() {
    return (
        <NavigationContainer><MyTabs/></NavigationContainer>
    );
}
const Tab = createBottomTabNavigator();

function MyTabs() {

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
                    padding: 10, // Increase the vertical margin of the tab bar,
                    borderWidth: 0,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
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