import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExpoJobQueue from "expo-job-queue";
import FastImage from "react-native-fast-image";
import { AddStackScreen, FutureStackScreen, HomeStackScreen, NotificationsStackScreen, ProfileStackScreen } from ".";
import TimestackButton from "../Components/TimestackButton";

const Tab = createBottomTabNavigator();
export default function Nav() {

    ExpoJobQueue.start().then(() => console.log("JOB_QUEUE_STARTED"));

    return (
        <Tab.Navigator
            screenOptions={{
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
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/home_black.png")} />
                        return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/home_white.png")} />
                    }
                }}
            />
            <Tab.Screen
                name="EventsStack"
                component={FutureStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/future_black.png")} />
                        return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/future_white.png")} />

                    }
                }}
            />

            <Tab.Screen
                name="AddStack"
                component={AddStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => <TimestackButton color={color} size={size} focused={focused} />
                }}
            />
            <Tab.Screen
                name="NotificationsStack"
                component={NotificationsStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/notifications_black.png")} />
                        return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/notifications_white.png")} />

                    }
                }}
            />
            <Tab.Screen
                name="ProfileStack"
                component={ProfileStackScreen}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/profile_black.png")} />
                        return <FastImage style={{ width: 30, height: 30 }} source={require("../assets/icons/nav/profile_white.png")} />

                    }
                }}
            />

        </Tab.Navigator>


    );
}
