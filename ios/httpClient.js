import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axiosRetry from "axios-retry";
import { build } from "./app.config";

axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 5000;
    },
    retryCondition: (error) => {
        return !(error.response?.status < 499);
    },
    onRetry: (retryCount, error) => {
        console.log(error);
        console.log(`Retrying ${retryCount} times`);
    }

});

export default async function HTTPClient (path, method, data, headers) {
	return axios({
		method: method,
		url: Constants.expoConfig.extra.apiUrl+"/v1"+path,
		data: data,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + await AsyncStorage.getItem('@session') || "",
			"x-timestack-build": build,
			...headers
		}
	})
}