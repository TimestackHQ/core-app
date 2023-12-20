import Main from "../Main";
import { frontendUrl } from "../utils/io";
import React, {useEffect} from "react";
import {AsyncLocalStorage} from "async_hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Viewer({ baseRoute, navigation }) {

	const [session, setSession] = React.useState(null);

	useEffect(() => {
		(async () => {
			const session = await AsyncStorage.getItem("TIMESTACK_SESSION");
			setSession(session);
		})();
	}, []);

	return (
		<Main
			baseRoute={baseRoute}
			frontendUrl={frontendUrl}
			navigation={navigation}
			session={session}
		/>
	);
}