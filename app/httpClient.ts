import axios, { Axios, AxiosResponse } from "axios";
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
	onRetry: (retryCount, error, requestConfig) => {
		console.log(error, requestConfig.url);
		console.log(`Retrying ${retryCount} times`);
	}

});

async function HTTPClient(path: string, method?: "GET" | "POST" | "PUT", data?: any, headers?: { [key: string]: string }): Promise<any>;
async function HTTPClient<T>(path: string, method?: "GET" | "POST" | "PUT", data?: any, headers?: { [key: string]: string }): Promise<AxiosResponse<T>>;
async function HTTPClient<T>(path: string, method: "GET" | "POST" | "PUT" = "GET", data?: any, headers?: {
	[key: string]: string
}) {

	return axios<T, AxiosResponse<T, T>, any>({
		method: method,
		url: Constants.expoConfig.extra.apiUrl + "/v1" + path,
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

export default HTTPClient;
