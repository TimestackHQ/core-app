import {useDispatch} from "react-redux";
import {useEffect} from "react";
import HTTPClient from "../utils/httpClient";

let mediaWatcher = null;

export default function IOSLayer ({children}) {

	const dispatch = useDispatch();

	useEffect(() => {
		if (mediaWatcher) {
			clearInterval(mediaWatcher);
		}
		mediaWatcher = setInterval(() => {
			window.ReactNativeWebView?.postMessage(JSON.stringify({
				request: "uploadQueue",
			}));
		}, 1000);
	}, []);

	const notificationsCountUpdate = () => HTTPClient("/notifications/count", "GET")
		.then(res => {
			dispatch({
				type: "SET_NOTIFICATION_COUNT",
				payload: res.data.count
			});
		})

	useEffect(() => {
		notificationsCountUpdate();
		window?.addEventListener("message", messageRaw => {
			try {
				const message = messageRaw?.data ? JSON.parse(messageRaw?.data) : null;
				if(message.response === "notificationsCount") {
					try {
						notificationsCountUpdate();
					}catch(err){

					}
				}
				else if (message.response === "uploadQueue") {
					dispatch({
						type: "SET_UPLOAD_QUEUE",
						payload: message.data
					})
				}

			} catch (err) {
				console.log(err);
			}

		});
	}, []);


	return children;
}