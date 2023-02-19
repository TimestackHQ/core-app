import axios from "axios";

export const restOrigin = "http://localhost:4000/v1";

export default function HTTPClient (path, method, data, headers) {
	console.log(	"Bearer " + window.localStorage.getItem("TIMESTACK_TOKEN") || ""
	)
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