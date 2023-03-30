import {useNavigation, useRoute} from "@react-navigation/native";
import Constants from "expo-constants";
import Main from "../Main";


const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;
export default function AddPeople () {

	const route = useRoute();
	const navigation = useNavigation();

	return <Main
		baseRoute={"/event/"+route.params?.eventId+"?noBuffer=true"}
		apiUrl={apiUrl}
		frontendUrl={frontendUrl}
		navigation={navigation}
	/>

}