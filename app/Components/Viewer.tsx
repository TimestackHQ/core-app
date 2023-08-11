import Main from "../Main";
import Constants from "expo-constants";
import { apiUrl, frontendUrl } from "../utils/io";

export default function Viewer({ baseRoute, navigation }) {

	return (
		<Main
			baseRoute={baseRoute}
			frontendUrl={frontendUrl}
			navigation={navigation}
		/>
	);
}