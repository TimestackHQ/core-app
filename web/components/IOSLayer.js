import {useDispatch} from "react-redux";
import {useEffect} from "react";

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

	useEffect(() => {
		window.addEventListener("message", async messageRaw => {
			try {
				const message = JSON.parse(messageRaw.data);
				if (message.response === "uploadQueue") {
					dispatch({
						type: "SET_UPLOAD_QUEUE",
						payload: message.data
					})
				}
			} catch (e) {
			}

		});
	}, []);

	return children;
}