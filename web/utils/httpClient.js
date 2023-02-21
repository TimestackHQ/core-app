import axios from "axios";

export const restOrigin = process.env.NEXT_PUBLIC_API_URL+"/v1";

export default function HTTPClient (path, method, data, headers) {
	return axios({
		method: method,
		url: restOrigin+path,
		data: data,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + window.localStorage.getItem("TIMESTACK_TOKEN") || "",
			...headers
		}
	})
}