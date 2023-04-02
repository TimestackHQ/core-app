import {RefreshControl, SafeAreaView, ScrollView} from "react-native";
import React, {useEffect} from "react";
import Viewer from "../Components/Viewer";

export default function HomeScreen({navigation, route}) {

	const [refreshing, setRefreshing] = React.useState(false);
	const [id, setId] = React.useState("null");
	const isFocused = navigation.isFocused();

	const onRefresh = () => {
		setRefreshing(true);
		setId(Math.random().toString(36).substring(7));
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	};

	useEffect(() => {
		onRefresh();
	}, [route.params?.updatedId]);

	useEffect(() => {
		if(isFocused && route.params?.refresh) {
			setRefreshing(true);
			onRefresh();
		}
	});



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