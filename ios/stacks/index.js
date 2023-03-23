import Main from "../Main";
import Constants from "expo-constants";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import * as React from "react";
import EventScreen from "../screens/Event";
import HomeScreen from "../screens/HomeScreen";
import FutureScreen from "../screens/Future";
import AddScreen from "../screens/Add";
import NotificationsScreen from "../screens/Notifications";
import ProfileScreen from "../screens/Profile";
import EditEvent from "../screens/EditEvent";



const Index = createNativeStackNavigator();
function CoreStackScreen({initialRouteName = "Main"}){
	return (
		<Index.Navigator initialRouteName={initialRouteName} screenOptions={{
			headerShadowVisible: false, // applied here
			headerBackTitleVisible: false,
			headerTintColor: 'black',
			headerTitle: "",
			fontcolor: "black",
			backgroundColor: '#ffffff',
		}}>
			<Index.Screen options={{headerShown: false}} name="Main" component={HomeScreen} />
			<Index.Screen options={{headerBackTitleVisible: false}} name="Event" component={EventScreen} />
			<Index.Screen options={{headerBackTitleVisible: true}} name="EditEvent" component={EditEvent} />
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