import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../../components/ios";
import FadeIn from "react-fade-in";
import Router, {useRouter} from "next/router";
import HTTPClient from "../../../utils/httpClient";
import {LazyLoadImage} from "react-lazy-load-image-component";
import AddPeopleScreen from "../../../components/AddPeopleScreen";
import Head from "next/head";

export default function EventIOS ({}) {

	const router = useRouter();
	const eventId = router.query.eventId;
	const [event, setEvent] = useState(null);
	const [uri, setUri] = useState("");



	useEffect(() => {

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
			})
			.catch((error) => {
				// window.location.href = "/main_ios";
			});

	}, []);

	useEffect(() => {
		HTTPClient("/media/"+event?.cover+"?thumbnail=true").then(res => setUri(res.data))
			.catch(err => {});
	}, [event])


	return (
			<div style={{
				backgroundImage: `url(${uri})`,
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				width: '100vw',
				height: '100vh',
				color: "white"
			}}>
				<div className={"container"}>
					<div className={"row justify-content-center"}>
						<div className={"col-8 text-center"} style={{marginTop: "10vh", color: "white"}}>
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
							}}>Cassis Vineyard</h2>
							<br/>
							<h6 style={{fontSize: "15px"}}>Cassis, France<br/>June 20, 2022</h6>
						</div>
						<div className={"col-10 text-center"}>
							<br/>
							{event?.people.map((invitee, index) => {
								return <img key={index} style={{width: "30px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
							})}
						</div>
						<div className={"col-12 text-center"}></div>
						<div className={"col-3"} style={{"height":"40px","position":"fixed","bottom":"8%","width":"100%"}}>
							<button className={"btn btn-secondary"} style={{fontSize: "20px", backgroundColor: "#FF9B9B", marginLeft: "35px", width: "48px", height: "120%", opacity: "80%", borderRadius: "15rem", borderWidth: 0}}>
								<div className={"white-shadow"}>
									<b>X</b>
								</div>
							</button>
						</div>
						<div className={"col-6 text-center"} style={{"height":"40px","position":"fixed","bottom":"8%","width":"100%"}}>
							<button className={"btn btn-secondary"} style={{fontSize: "20px", width: "50%", height: "120%", opacity: "80%", borderRadius: "10rem", backgroundColor: "black", borderWidth: 0}}>
								<div className={"white-shadow"}>
									<b>JOIN</b>
								</div>
							</button>
						</div>
					</div>
				</div>


			</div>
		// </div>

	);
}