import {useDispatch} from "react-redux";
import {useEffect} from "react";


export default function IOSLayer ({children}) {

	const dispatch = useDispatch();

	useEffect(() => {
		window.addEventListener("message", async messageRaw => {
			try {
				const message = JSON.parse(messageRaw.data);
				console.log(message)
				if (message.response === "uploadQueue") {
					console.log("uploadQueue", message.data);
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