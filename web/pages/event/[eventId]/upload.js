import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../../components/ios";
import FadeIn from "react-fade-in";
import {useRouter} from "next/router";

export default function EventIOS ({}) {

	const eventId = useRouter().query.eventId;
	const [files, setFiles] = useState([]);

	useEffect(() => {
		// Array.from(files).map(async file=> {
		// 	console.log(Buffer.from(await file.arrayBuffer()).toString("binary"));
		// });
	}, [files]);

	const upload = () => {
		window.ReactNativeWebView?.postMessage(JSON.stringify({
			request: "uploadMedia",
			eventId: eventId,
		}));
	}

	window.addEventListener("message", messageRaw => {
		const message = JSON.parse(messageRaw.data);
		if(message.response !== "uploadMedia") return;
		try {
			const mediaFiles = message?.data;
			if(!mediaFiles || mediaFiles.canceled) return;
			setFiles(mediaFiles.assets)
		}catch(err){

		}
	});

	return (
		<IOS buttons={[
			{
				icon: "leftArrow",
				href: "/main_ios",
				position: "left"
			},
			// {
			// 	icon: "leftArrow",
			// 	href: "/main_ios",
			// }
		]} >
			<FadeIn>
				<div className={"row"} style={{borderRight: "2rem", borderColor: "black"}}>
					<hr/>
					<button className={"btn btn-outline-secondary"} onClick={upload} >
						Upload
					</button>
					<hr/>
					<div className={"col-4"} style={{margin: 0, paddingLeft: 1, paddingRight: 1, height: "200px"}}>

						<div className="image-upload">
							<label htmlFor="file-input" style={{height: "200px"}}>
								<img style={{objectFit: "cover"}} alt={"Cassis 2022"} height={"100%"} width={"100%"} src={"/images/add-media.png"}/>
							</label>

							<input id={"file-input"} multiple type="file" onChange={(e) => {
								setFiles(e.target.files);
							}}/><br/><br/>
						</div>


					</div>

					{Array.from(files)?.map((file, i) => {
						return (
							<div className={"col-4"} style={{margin: 0, paddingLeft: 1, paddingRight: 1, height: "200px"}}>
								<img key={i} style={{objectFit: "cover"}} alt={"Cassis 2022"} height={"100%"} width={"100%"} src={"data:image/png;base64,"+file.base64}/>
							</div>
						);
					})}



				</div>
			</FadeIn>
		</IOS>
	);
}