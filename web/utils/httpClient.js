import axios from "axios";

const origin = process.env.NEXT_PUBLIC_API_URL+"/v1";

export default function HTTPClient (path, method, data) {
	console.log(	"Bearer " + window.localStorage.getItem("TIMESTACK_TOKEN") || ""
)
	return axios({
		method: method,
		url: origin+path,
		data: data,
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"Authorization": "Bearer " + window.localStorage.getItem("TIMESTACK_TOKEN") || ""
		}
	})
}