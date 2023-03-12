import {createStackNavigator} from "react-navigation-stack";
import Main from "../Main";
import Constants from "expo-constants";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {TouchableOpacity, View, Text, SafeAreaView} from "react-native";
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
	return <Viewer onStyle={{flex: 1}} baseRoute={"/event/"+route.params.eventId} navigation={navigation}/>
}


const HomeStack = createNativeStackNavigator();
export default function HomeStackScreen() {
	return (
		<HomeStack.Navigator screenOptions={{
			headerShown: false
		}}>
			<HomeStack.Screen name="Main" component={HomeScreen} />
			<HomeStack.Screen name="Event" component={EventScreen} />

		</HomeStack.Navigator>
	);
}