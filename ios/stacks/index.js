import Main from "../Main";
import Constants from "expo-constants";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {getFocusedRouteNameFromRoute, useNavigation, useRoute} from '@react-navigation/native';
import * as React from "react";
import EventScreen from "../screens/Event";
import HomeScreen from "../screens/HomeScreen";
import FutureScreen from "../screens/Future";
import AddScreen from "../screens/Add";
import NotificationsScreen from "../screens/Notifications";
import ProfileScreen from "../screens/Profile";
import EditEvent from "../screens/EditEvent";
import MediaView from "../screens/MediaView";
import Upload from "../screens/Upload";
import Roll from "../screens/Roll";
import AddPeople from "../screens/AddPeople";



const Index = createNativeStackNavigator();
function CoreStackScreen({initialRouteName = "Main"}){

	const navigation = useNavigation();
	const route = useRoute();

	React.useLayoutEffect(() => {
		const routeName = getFocusedRouteNameFromRoute(route);
		if (routeName === "MediaView"){
			navigation.setOptions({tabBarStyle: {display: 'none'}});
		}else {
			navigation.setOptions({tabBarStyle: {
					padding: 20, // Increase the vertical margin of the tab bar,
					borderWidth: 0,
					margin: 0
			}});
		}
	}, [navigation, route]);

	return (
		<Index.Navigator initialRouteName={initialRouteName} screenOptions={{
			headerShadowVisible: false, // applied here
			headerTintColor: 'black',
			headerTitle: "",
			fontcolor: "black",
			headerBackTitleVisible: false,
			backgroundColor: '#ffffff',


		}}>
			<Index.Screen options={{headerShown: false, headerBackTitle: "Hey"}} name="Main" component={HomeScreen} />

			<Index.Screen name="Event" component={EventScreen} />
			<Index.Screen options={{presentation: "formSheet", headerShown: false}} name="EditEvent" component={EditEvent} />
			<Index.Screen options={{presentation: "formSheet", headerShown: false}} name="Upload" component={Upload} />
			<Index.Screen options={{presentation: "formSheet", headerShown: false}} name="AddPeople" component={AddPeople} />
			<Index.Screen options={{presentation: "card", gestureDirection: "vertical", fullScreenGestureEnabled: true}} name="MediaView" component={MediaView} />
			<Index.Screen options={{presentation: "formSheet", headerShown: false}} name="Roll" component={Roll} />


			<Index.Screen options={{headerShown: false}} name="Future" component={FutureScreen} />
			<Index.Screen options={{headerShown: false}} name="Add" component={AddScreen} />
			<Index.Screen options={{headerShown: false}} name="Notifications" component={NotificationsScreen} />
			<Index.Screen options={{headerShown: false}} name="Profile" component={ProfileScreen} />

		</Index.Navigator>
	);
}

export function HomeStackScreen() {
	return <CoreStackScreen initialRouteName="Main"/>
}

export function FutureStackScreen() {
	return <CoreStackScreen initialRouteName="Future"/>
}

export function AddStackScreen() {
	return <CoreStackScreen initialRouteName="Add"/>
}

export function NotificationsStackScreen() {
	return <CoreStackScreen initialRouteName="Notifications"/>
}

export function ProfileStackScreen() {
	return <CoreStackScreen initialRouteName="Profile"/>
}