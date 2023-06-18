import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ErrorScreen } from "../screens/Error";
import AuthScreen from "../screens/Auth";
import Nav from "./nav";
import Invite from "../screens/Invite";
import * as Notifications from "expo-notifications";
import HTTPClient from "../httpClient";

import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthScreenNavigationProp, InviteScreenNavigationProp, NotificationsScreenNavigationProp, SocialProfileScreenNavigationProp } from "../navigation";
import { ConnectionRequest } from "@shared-types/*";


const CoreStack = createNativeStackNavigator();
export default function CoreNavigationStack() {

    const navigator = useNavigation<
        InviteScreenNavigationProp |
        AuthScreenNavigationProp |
        NotificationsScreenNavigationProp |
        SocialProfileScreenNavigationProp
    >();

    const urlSource = Linking.useURL();
    const [authenticated, setAuthenticated] = useState(true);
    const [currentSession, setCurrentSession] = useState(null);

    const urlListenerWorker = url => {
        console.log("URL deeplink intercepted, navigating to: " + url);
        const path = url.replace("timestack://", "");
        console.log(path);
        if (path.startsWith("event/")) {
            navigator.navigate("Invite", {
                eventId: path.split("/")[1]
            });
        }
    }

    useEffect(() => {
        console.log("Here", urlSource);
        if (urlSource) {
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
                    if (err.response.status === 401) {
                        console.log("Not authenticated, redirecting to auth screen");
                        navigator.navigate("Auth", {
                            redirect: urlSource
                        });
                    }
                })
        }).then(_r => { });

        // push notifications reader
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {

            console.log(JSON.stringify(response));

            console.log("received notification response");

            const notification = response.notification.request.content;
            const url = notification?.data.payload?.url;
            if (url) {
                navigator.navigate("NotificationsStack", {
                    screen: "Notifications",
                });
            };

            if (!notification.data) return;
            // @ts-ignore
            const pushPayload: ConnectionRequest = notification.data;

            console.log("push payload", pushPayload);


            if (pushPayload.type === "connectionRequest") {
                navigator.navigate("SocialProfile", {
                    userId: pushPayload.payload.userId
                });
            }

        });


        return () => {
            subscription.remove();
        }
    }, [currentSession]);

    return (
        <CoreStack.Navigator screenOptions={{
            headerShown: false,
            gestureEnabled: false
        }}>
            <CoreStack.Screen name="Main" component={Nav} />
            <CoreStack.Screen name="Auth" component={AuthScreen} />
            <CoreStack.Screen name="Invite" component={Invite} />
            <CoreStack.Screen
                options={{ presentation: "formSheet" }}
                name="Error" component={ErrorScreen}
            />

        </CoreStack.Navigator>
    );
}
