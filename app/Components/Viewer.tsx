import Main from "../Main";
import { frontendUrl } from "../utils/io";
import React, {useEffect} from "react";
import {AsyncLocalStorage} from "async_hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useIsFocused} from "@react-navigation/native";

export default function Viewer({ baseRoute, navigation }) {

	const [session, setSession] = React.useState(null);

	const isFocused = useIsFocused();

	useEffect(() => {
		(async () => {
			const session = await AsyncStorage.getItem("@session");
			setSession(session);
		})();
	}, [isFocused]);

	return (
		<Main
			baseRoute={baseRoute}
			frontendUrl={frontendUrl}
			navigation={navigation}
			session={session}
		/>
	);
}