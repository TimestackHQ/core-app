import Main from "../Main";
import Constants from "expo-constants";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Upload from "../screens/Upload";
import {ModalView} from "react-native-ios-modal";
import * as React from "react";
import {View, Text, Button, ScrollView, RefreshControl, SafeAreaView} from "react-native";
import {useEffect} from "react";
import Event from "../screens/Event";
const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;
function Viewer({baseRoute, navigation}) {
	return (
		<Main
			baseRoute={baseRoute}
			apiUrl={apiUrl}
			frontendUrl={frontendUrl}
			navigation={navigation}
		/>
	);
}
function HomeScreen({navigation, route}) {

	const [refreshing, setRefreshing] = React.useState(false);
	const [id, setId] = React.useState("null");

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		setId(Math.random().toString(36).substring(7));
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	return <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
		<ScrollView
			// scrollEnabled={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			contentContainerStyle={{flexGrow: 1}}
			style={{flex: 1, height: "100%", backgroundColor: "white"}}
		>
			<Viewer onStyle={{flex: 1}} baseRoute={"/main_ios?id="+id} navigation={navigation}/>
		</ScrollView>
	</SafeAreaView>
}

function EventScreen({navigation, route}) {
	return <Event />
}

function FutureScreen({navigation}) {
	return <Viewer navigation={navigation} baseRoute={"/main_ios"}/>
}

function AddScreen({navigation}) {
	return <Viewer navigation={navigation} baseRoute={"/new"}/>
}

function NotificationsScreen({navigation}) {

	const [refreshing, setRefreshing] = React.useState(false);
	const [id, setId] = React.useState("null");

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		setId(Math.random().toString(36).substring(7));
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	return <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
		<ScrollView
			// scrollEnabled={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			contentContainerStyle={{flexGrow: 1}}
			style={{flex: 1, height: "100%", backgroundColor: "white"}}
		>
			<Viewer navigation={navigation} baseRoute={"/notifications?id="+id}/>
		</ScrollView>
	</SafeAreaView>

}

function ProfileScreen({navigation}) {
	return <Viewer navigation={navigation}  baseRoute={"/profile"}/>
}


const Index = createNativeStackNavigator();
function CoreStackScreen({initialRouteName = "Main"}){
	return (
		<Index.Navigator initialRouteName={initialRouteName} screenOptions={{
			headerShown: false,
			headerShadowVisible: false, // applied here
			headerBackTitleVisible: false,
			headerTintColor: 'black',
			headerTitle: "",
			fontcolor: "black",
			backgroundColor: '#ffffff',
		}}>
			<Index.Screen name="Main" component={HomeScreen} />
			<Index.Screen options={{headerShown: true}} name="Event" component={EventScreen} />
			<Index.Screen name="Future" component={FutureScreen} />
			<Index.Screen name="Add" component={AddScreen} />
			<Index.Screen name="Notifications" component={NotificationsScreen} />
			<Index.Screen name="Profile" component={ProfileScreen} />

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