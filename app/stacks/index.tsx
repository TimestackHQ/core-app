import Main from "../Main";
import Constants from "expo-constants";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStackNavigator } from "@react-navigation/stack";

import { getFocusedRouteNameFromRoute, useNavigation, useRoute } from '@react-navigation/native';
import * as React from "react";
import EventScreen from "../screens/Event";
import HomeScreen from "../screens/HomeScreen";
import FutureScreen from "../screens/Future";
import AddScreen from "../screens/Add";
import NotificationsScreen, { NotificationsScreenHeader } from "../screens/Notifications";
import EditEvent from "../screens/EditEvent";
import MediaView from "../screens/MediaView";
import Roll from "../screens/Roll";
import AddPeople from "../screens/AddPeople";
import Profile from "../screens/ProfileScreen";
import SocialProfile from "../screens/SocialProfile";
import UploadQueue from "../screens/UploadQueue";
import TextComponent from "../Components/Library/Text";
import MutualsScreen from "../screens/Mutuals";
import EventsList from "../screens/EventsList";
import LinkedEvents from "../screens/LinkedEventsScreen";
import ChatSpaceScreen from "../screens/ChatSpaceScreen";

const DefaultBackButtonHeader = name => ({
	headerShadowVisible: true,
	headerTransparent: false,
	headerBackTitleVisible: true,
	headerBackTitle: name,
	headerBackTitleStyle: {
		fontSize: 30,
		fontFamily: "Red Hat Display Semi Bold",
	}
})



const Index = createNativeStackNavigator();
export default function CoreStackScreen({ initialRouteName = "Main" }) {

	const navigation = useNavigation();
	const route = useRoute();

	React.useLayoutEffect(() => {
		const routeName = getFocusedRouteNameFromRoute(route);
		if (routeName === "MediaView") {
			navigation.setOptions({ tabBarStyle: { display: 'none' } });
		} else {
			navigation.setOptions({
				tabBarStyle: {
					padding: 20,
					borderWidth: 0,
					margin: 0
				}
			});
		}
	}, [navigation, route]);

	return (
		<Index.Navigator initialRouteName={initialRouteName} screenOptions={{
			headerShadowVisible: false, // applied here
			headerTintColor: 'black',
			headerTitle: "",
			headerBackTitleVisible: false,
		}}>
			<Index.Screen options={{ headerShown: false, headerBackTitle: "Hey" }} name="Main" component={HomeScreen} />

			<Index.Screen name="Event" component={EventScreen} />
			<Index.Screen name="EventsList" options={{
				...DefaultBackButtonHeader("Events"),
				// headerSearchBarOptions: {
				// 	hideWhenScrolling: true,
				// 	obscureBackground: true,
				// }

			}} component={EventsList} />
			<Index.Screen options={{ presentation: "formSheet", headerShown: false }} name="EditEvent" component={EditEvent} />
			<Index.Screen options={{ presentation: "card", headerShown: true }} name="LinkedEvents" component={LinkedEvents} />
			<Index.Screen options={{ presentation: "card", headerShown: false }} name="ChatSpace" component={ChatSpaceScreen} />
			<Index.Screen options={{ presentation: "formSheet", headerShown: false }} name="AddPeople" component={AddPeople} />
			<Index.Screen options={{ presentation: "card", gestureDirection: "vertical", fullScreenGestureEnabled: true, animation: "none" }} name="MediaView" component={MediaView} />
			<Index.Screen options={{ presentation: "formSheet", headerShown: false }} name="Roll" component={Roll} />
			<Index.Screen options={{ headerShown: false }} name="Future" component={FutureScreen} />
			<Index.Screen options={{ headerShown: false }} name="Add" component={AddScreen} />
			<Index.Screen options={DefaultBackButtonHeader("Notifications")}
				name="Notifications" component={NotificationsScreen} />
			<Index.Screen options={{
				headerShown: false,
				headerBlurEffect: "systemUltraThinMaterialDark",
			}} name="Profile" component={Profile} />

			<Index.Screen options={{ headerShown: true }} name="SocialProfile" component={SocialProfile} />

			<Index.Screen options={{ presentation: "formSheet", headerShown: false }} name="UploadQueue" component={UploadQueue} />

			<Index.Screen options={{ headerBackTitle: "Hey" }} name={"Mutuals"} component={MutualsScreen} />

		</Index.Navigator>
	);
}

export function HomeStackScreen() {
	return <CoreStackScreen initialRouteName="Main" />
}

export function FutureStackScreen() {
	return <CoreStackScreen initialRouteName="Future" />
}

export function AddStackScreen() {
	return <CoreStackScreen initialRouteName="Add" />
}

export function NotificationsStackScreen() {
	return <CoreStackScreen initialRouteName="Notifications" />
}

export function ProfileStackScreen() {
	return <CoreStackScreen initialRouteName="Profile" />
}