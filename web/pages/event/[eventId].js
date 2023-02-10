import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../components/ios";
import FadeIn from "react-fade-in";
import HTTPClient, {restOrigin} from "../../utils/httpClient";
import {useRouter} from "next/router";
import MediaView from "../../components/MediaView";
import {LazyLoadImage} from "react-lazy-load-image-component";
import Gallery from "../../components/Gallery";

export default function EventIOS ({}) {

	const eventId = useRouter().query.eventId;

	const [event, setEvent] = useState(null);

	const [media, setMedia] = useState([]);

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
		]} timestackButtonLink={"./"+event?._id+"/upload"}>
			<div className={"container"}>
				<FadeIn>
					<FadeIn delay={400}>
						<div className={" row"}>
							<div className={"col-5"} autofocus={true}>
								<LazyLoadImage
									src={uri}
					                style={{borderRadius: "15px", objectFit: "cover"}}
					                alt={""}
					                width={"100%"} height={"200px"}
									threshold={500}
								/>
							</div>
							<div className={"col-7 position-relative"}>
								<div className="position-absolute top-0 start-0">
									<h2 className={"overflow-auto"} style={{marginLeft: "2px", marginBottom: "0px", lineHeight: "1", maxHeight: "52px"}}><b>{event?.name}</b></h2>
								</div>
								<div className="position-absolute bottom-0 start-0">
									<p style={{fontSize: "15px", marginBottom: "0px", marginLeft: "2px"}}>{event?.location}</p>
									<p style={{fontSize: "15px", marginLeft: "2px"}}>June 17 - 21, 2022</p>
								</div>

							</div>

						</div>
					</FadeIn>

					<br/>
					<div className={"row"}>
						<div className={"col-4 text-center"}>
							<h5 style={{margin: 0}}>{event?.peopleCount}</h5>
							<h5 style={{color: "gray"}}>{event?.peopleCount === 1 ? "Person" : "People"}</h5>
						</div>

						<div className={"col-4 text-center"}>
							<h5 style={{margin: 0}}>{event?.mediaCount}</h5>
							<h5 style={{color: "gray"}}>{event?.mediaCount === 1 ? "Memory" : "Memories"}</h5>
						</div>

						<div className={"col-4 text-center"}>
							<h5 style={{margin: 0}}>0</h5>
							<h5 style={{color: "gray"}}>Revisits</h5>
						</div>
					</div>
					<br/>
					<div style={{}}>
						<img onClick={() => setWaitingForPeople(true)} style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
						{event?.people.map((invitee, index) => {
							return <img style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
						})}

					</div>
					<br/>
					<div className={"row"}>
						<Gallery gallery={event?.media}/>
					</div>
					<br/>
					<br/>
				</FadeIn>
			</div>
		</IOS>
	);
}