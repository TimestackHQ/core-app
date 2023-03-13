import Main from "../Main";
import Constants from "expo-constants";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Upload from "../screens/Upload";
import {ModalView} from "react-native-ios-modal";
import * as React from "react";
import {View, Text, Button} from "react-native";
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
	return <Viewer onStyle={{flex: 1}} baseRoute={"/main_ios"} navigation={navigation}/>
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
	return <Viewer navigation={navigation} baseRoute={"/notifications"}/>
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

	const modalRef = React.createRef();

	useEffect(() => {
		console.log(modalRef);
		if(modalRef.current) modalRef.current.setVisibility(true);
	})


	return <View>
		<ModalView  ref={modalRef}>
			<View>
				<Text>Hey</Text>
			</View>


		</ModalView>
	</View>
}

export function NotificationsStackScreen() {
	return <CoreStackScreen initialRouteName="Notifications"/>
}

export function ProfileStackScreen() {
	return <CoreStackScreen initialRouteName="Profile"/>
}