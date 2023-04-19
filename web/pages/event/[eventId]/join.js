import React, {Fragment, useEffect, useState} from 'react';
import Router, {useRouter} from "next/router";
import HTTPClient from "../../../utils/httpClient";
import axios from "axios";
import FadeIn from "react-fade-in";
import Link from "next/link";
import ProfilePicture from "../../../components/ProfilePicture";
import {NativeCancelEventInvite, NativeNavigate, NativeNavigateBack} from "../../../utils/nativeBridge";
import {Navigate} from "react-big-calendar";
import {dateFormat} from "react-big-calendar/lib/utils/propTypes";
import {dateFormatter} from "../../../utils/time";

export default function EventIOS ({}) {

	const router = useRouter();
	const urlParams = new URLSearchParams(window.location.search);
	const eventId = window.location.href.split("/").reverse()[1];
	const [joined, setJoined] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const [event, setEvent] = useState(null);
	const [dateString, setDateString] = useState("");
	const [uri, setUri] = useState("");



	useEffect(() => {

// Get the value of the "id" parameter
		HTTPClient("/events/"+eventId+"?noBuffer=true", "GET")
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
						console.log(err);
r
						Router.push("/event/"+eventId);
					});

			})
			.catch((error) => {
				console.log(error);
				Router.push("/event/"+eventId);
			});

	}, []);

	useEffect(() => {
		setDateString(dateFormatter(event?.startsAt,event?.endsAt));
	}, []);

	const join = () => {
		HTTPClient("/events/"+eventId+"/join", "POST")
			.then((response) => {
				setJoined(true);
				NativeNavigate("Event", {

						eventId: eventId,
						eventName: event.name,
						refresh: true
				})
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
						<img className={"image-fade-in"} src={uri} style={{"pointerEvents":"none","position":"absolute","width":"100%","height":"100%","zIndex":"-10", objectFit: "cover", backgroundColor: "black"}} />

					</FadeIn>
					<div className={"container"} style={{zIndex: 1}}>
						<div className={"row "}>
							<FadeIn delay={600}  >
								<div >
									<div className={"row justify-content-center"}>
										<div className={"col-12  text-center"} style={{marginTop: "8vh", color: "white"}}>
											<br/>
										</div>

										<div className={"col-12 text-center"}>
											<h2  className={"white-shadow"} style={{
												fontFamily: '"athelas", serif',
												fontWeight: 1000,
												fontStyle: "normal",
												fontSize: "3.3rem",
												color: "white",
												paddingTop: "3vh",
												letterSpacing: "-3px",
												marginBottom: "0px",
												lineHeight: "0.9",
											}}>{event?.name}</h2>
											<br/>
											<h6 style={{fontSize: "15px"}}>
												{event?.location}
												<br/>{dateFormatter(new Date(event?.startsAt), event?.endsAt ? new Date(event?.endsAt) : null)}
											</h6>
										</div>
										<div className={"col-12 text-center"} style={{width: "100%"}}>
											<br/>
											{event.people.map((user, i) => {
												return <ProfilePicture dark={true} style={{marginRight: "5px",marginBottom: 2}} key={i} width="30px" height={"30px"} location={user?.profilePictureSource}/>

											})}
										</div>
									</div>
								</div>

							</FadeIn>
								<div className={"col-2"} style={{"height":"40px", "width":"40px", position: "absolute", bottom: "7.5%", zIndex: 10}}>
									<FadeIn delay={600}>
										<button onClick={() => {
											NativeCancelEventInvite(eventId);
										}}  className={"btn btn-secondary"} style={{fontSize: "20px", backgroundColor: "#FF9B9B", marginLeft: "15px", width: "55px", height: "55px", opacity: "80%", borderRadius: "15rem", borderWidth: 0}}>
											<div className={"white-shadow"}>
												<img src={"/images/xmark.png"} style={{width: "20px", marginBottom: "3px"}}/>
											</div>
										</button>
									</FadeIn>


								</div>
								<div className={"col-6 text-center"} style={{"height":"40px", "width":"100%", position: "absolute", bottom: "7.5%"}}>
									<FadeIn delay={600}>
										<button onClick={join} className={"btn btn-secondary"} style={{fontSize: "20px", width: "55%", height: "55px", opacity: "80%", borderRadius: "10rem", backgroundColor: "black", borderWidth: 0}}>
											<div className={"white-shadow"} style={{fontWeight: "500", fontSize: "25px"}}>
												JOIN
											</div>
										</button>
									</FadeIn>

								</div>
						</div>
					</div>

			</div>
		// </div>

	) : <div style={{backgroundColor: "black"}}/>;
}