import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
export default async function HTTPClient (path, method, data, headers) {
	return axios({
		method: method,
		url: Constants.expoConfig.extra.apiUrl+"/v1"+path,
		data: data,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + await AsyncStorage.getItem('@session') || "",
			"x-app-version": "0.22.41",
			...headers
		}
	})
}