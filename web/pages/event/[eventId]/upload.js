import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../../components/ios";
import FadeIn from "react-fade-in";
import {useRouter} from "next/router";
import HTTPClient from "../../../utils/httpClient";
import {LazyLoadImage} from "react-lazy-load-image-component";

export default function EventIOS ({}) {

	const router = useRouter();
	const eventId = router.query.eventId;
	const [event, setEvent] = useState(null);
	const [uri, setUri] = useState("");

	useEffect(() => {
		HTTPClient("/media/"+event?.cover+"?thumbnail=true").then(res => setUri(res.data))
			.catch(err => {});
	}, [event])

	useEffect(() => {

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
			})
			.catch((error) => {
				window.location.href = "/main_ios";
			});

	}, []);

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
		<IOS hideNavbar={true} buttons={[
			// {
			// 	icon: "leftArrow",
			// 	href: "/main_ios",
			// 	position: "left"
			// },
			// {
			// 	icon: "leftArrow",
			// 	href: "/main_ios",
			// }
		]} >
			<FadeIn>
				<br/>
				<br/>
				<br/>
				<div className={"container"} >
					<div className="row">
						<div className={"card"} style={{
							boxShadow: "rgba(100, 100, 111, 0.5) 0px 10px 50px 0px",
							borderRadius: "3rem",
							borderBottomRightRadius: "0px",
							borderBottomLeftRadius: "0px",
							padding: 0
						}}>

							<div className={"card-body"} >
								<div className={"row"} style={{margin: "0.5rem", paddingTop: "10px", paddingLeft: 1, paddingRight: 1, padding: 0}}>

									<div className={"col-6"} >
										<h1>
											<b>Upload</b>
										</h1>
									</div>
									<div className={"col-6 text-end"} onClick={() => router.push("/event/"+eventId)}>
										<img src={"/icons/x.svg"} width={"20px"}/>
									</div>
								</div>
								<br/>
								<div className={"row"} autofocus={true} style={{}}>
									<div className={"col-3"}>
										<LazyLoadImage
											src={uri}
											style={{borderRadius: "15px", objectFit: "cover"}}
											alt={""}
											width={"80px"} height={"120px"}
										/>
									</div>
									<div className={"col-8"}>
										<h6 style={{marginBottom: "0px"}}>{event?.name}</h6>
										<p style={{color: "gray"}}>{event?.location}</p>
									</div>
									<div className={"col-12"}>
										<br/>
										<img style={{width: "42px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
										{event?.people.map((invitee, index) => {
											return <img key={index} style={{width: "42px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
										})}
										<hr/>
									</div>
								</div>

							</div>
							<div>
								<div className={"col-4"} style={{margin: 0, paddingLeft: 1, paddingRight: 1, height: "200px", padding: 0}}>
									<br/>
									<img onClick={upload} style={{objectFit: "cover"}} alt={"Cassis 2022"} height={"100%"} width={"100%"} src={"/images/add-media.png"}/>
								</div>
								<div style={{display: "flex",
									flexDirection: "column",
									height: "50vh"}} />
							</div>
						</div>
					</div>
				</div>
			</FadeIn>
		</IOS>
	);
}