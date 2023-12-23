import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ErrorScreen } from "../screens/Error";
import AuthScreen from "../screens/Auth";
import Nav from "./nav";
import Invite from "../screens/Invite";
import * as Notifications from "expo-notifications";
import HTTPClient from "../httpClient";
import { AuthScreenNavigationProp, InviteScreenNavigationProp, NotificationsScreenNavigationProp, SocialProfileScreenNavigationProp } from "../navigation";
import { ConnectionRequest } from "@shared-types/*";
import Roll from "../screens/Roll";
import * as React from "react";
import LinkContent from "../screens/LinkContentScreen";
import MediaView from "../screens/MediaView";
import ManageContentLinksScreen from "../screens/ManageContentLinksScreen";
import SocialProfileSettingsScreen from "../screens/SocialProfileSettings";

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
        alert(path)
        if (path.startsWith("event/")) {
            navigator.navigate("Invite", {
                eventId: path.split("/")[1]
            });
        }
        else if (path.startsWith("user/")) {
            navigator.navigate("SocialProfile", {
                userId: path.split("/")[1]
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
            gestureEnabled: false,
        }}>
            <CoreStack.Screen name="Main" component={Nav} options={{headerShown: false}} />
            <CoreStack.Screen name="Auth" component={AuthScreen} options={{headerShown: false}} />
            <CoreStack.Screen name="Invite" component={Invite} options={{headerShown: false}} />
            <CoreStack.Screen
                options={{ presentation: "modal", headerShown: false }}
                name="Error" component={ErrorScreen}
            />
            <CoreStack.Screen options={{ presentation: "formSheet", headerShown: false, gestureEnabled: true }} name="Roll" component={Roll} />
            <CoreStack.Screen options={{
                presentation: "formSheet",
                gestureEnabled: true ,
                headerShown: true,
            }} name="LinkContent" component={LinkContent} />
            <CoreStack.Screen options={{
                presentation: "formSheet",
                gestureEnabled: true ,
                headerShown: true,
            }} name="ManageContentLinks" component={ManageContentLinksScreen} />
            <CoreStack.Screen options={{
                presentation: "formSheet",
                gestureDirection: "vertical",
                fullScreenGestureEnabled: true,
                gestureEnabled: true,
                headerShown: true,

                headerTitle: "",
            }} name="MediaView" component={MediaView} />

            <CoreStack.Screen options={{
                presentation: "formSheet",
                gestureDirection: "vertical",
                fullScreenGestureEnabled: true,
                gestureEnabled: true,
                headerShown: false,
            }} name="SocialProfileSettings" component={SocialProfileSettingsScreen} />

        </CoreStack.Navigator>
    );
}
