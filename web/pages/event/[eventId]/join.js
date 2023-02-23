import React, {Fragment, useEffect, useState} from 'react';
import Router, {useRouter} from "next/router";
import HTTPClient from "../../../utils/httpClient";
import axios from "axios";
import FadeIn from "react-fade-in";
import Link from "next/link";

export default function EventIOS ({}) {

	const eventId = Router.query.eventId;
	const [joined, setJoined] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const [event, setEvent] = useState(null);
	const [uri, setUri] = useState("");



	useEffect(() => {

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
				if(response.data.message === "joinRequired") {
					setJoined(false);
				}
				HTTPClient("/media/"+response?.data?.event?.cover).then(res => {
					setUri(res.data);
					setLoaded(true);
				})
					.catch(err => {
						Router.push("/event/"+eventId);
					});

			})
			.catch((error) => {
				Router.push("/event/"+eventId);
			});

	}, []);

	useEffect(() => {

	}, [event]);

	const join = () => {
		HTTPClient("/events/"+eventId+"/join", "POST")
			.then((response) => {
				setJoined(true);
				Router.push("/event/"+eventId);
			})
			.catch((error) => {
				alert("Error joining event. Please try again later.");
			});
	}

	return (loaded && event?.name) ? (
			<div style={{
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				width: '100vw',
				height: '100vh',
				color: "white"
			}}>
					<FadeIn>
						<img className={"image-fade-in"} src={uri} style={{"pointerEvents":"none","position":"absolute","width":"100%","height":"100%","zIndex":"-1", objectFit: "cover", backgroundColor: "black"}} />

					</FadeIn>
					<div className={"container"}>
						<div className={"row "}>
							<FadeIn delay={600}  >
								<div>
									<div className={"row justify-content-center"}>
										<div className={"col-12  text-center"} style={{marginTop: "10vh", color: "white"}}>
											<br/>
											<img className={"white-circle-shadow"} src={"/images/achraf.jpeg"} style={{
												width: "30px",
												borderRadius: "100px",
												borderColor: "black",
												borderWidth: "2px",
												marginRight: "10px",
											}} /> invites you to
										</div>

										<div className={"col-12 text-center"}>
											<h2  className={"white-shadow"} style={{
												fontFamily: '"athelas", serif',
												fontWeight: 1000,
												fontStyle: "normal",
												fontSize: "3.3rem",
												color: "white",
												paddingTop: "5vh",
												letterSpacing: "-3px",
												marginBottom: "0px",
												lineHeight: "0.9",
											}}>{event?.name}</h2>
											<br/>
											<h6 style={{fontSize: "15px"}}>{event?.location}<br/>June 20, 2022</h6>
										</div>
										<div className={"col-12 text-center"}>
											<br/>
											{event?.people.map((invitee, index) => {
												return <img key={index} style={{width: "30px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
											})}
										</div>
									</div>
								</div>

							</FadeIn>
							<div className={"col-12 text-center"}></div>
							<div className={"col-3"} style={{"height":"40px","position":"fixed","bottom":"8%","width":"100%", zIndex: 1}}>
								<FadeIn delay={600}>
									<button onClick={() => Router.back()}  className={"btn btn-secondary"} style={{display: "inline-block", fontSize: "20px", backgroundColor: "#FF9B9B", marginLeft: "35px", width: "48px", height: "120%", opacity: "80%", borderRadius: "15rem", borderWidth: 0}}>
										<div className={"white-shadow"}>
											<b>X</b>
										</div>
									</button>
								</FadeIn>

							</div>
							<div className={"col-6 text-center"} style={{"height":"40px","position":"fixed","bottom":"8%","width":"100%", zIndex: 1}}>
								<FadeIn delay={600}>
									<button onClick={join} className={"btn btn-secondary"} style={{fontSize: "20px", width: "50%", height: "120%", opacity: "80%", borderRadius: "10rem", backgroundColor: "black", borderWidth: 0}}>
										<div className={"white-shadow"}>
											<b>JOIN</b>
										</div>
									</button>
								</FadeIn>

							</div>
						</div>
					</div>

			</div>
		// </div>

	) : null;
}