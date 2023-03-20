import Main from "../Main";
import Constants from "expo-constants";
const apiUrl = Constants.expoConfig.extra.apiUrl;
const frontendUrl = Constants.expoConfig.extra.frontendUrl;
export default function Viewer({baseRoute, navigation}) {
	return (
		<Main
			baseRoute={baseRoute}
			apiUrl={apiUrl}
			frontendUrl={frontendUrl}
			navigation={navigation}
		/>
	);
}