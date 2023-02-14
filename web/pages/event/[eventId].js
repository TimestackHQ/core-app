import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../components/ios";
import FadeIn from "react-fade-in";
import HTTPClient, {restOrigin} from "../../utils/httpClient";
import Router, {useRouter} from "next/router";
import MediaView from "../../components/MediaView";
import {LazyLoadImage} from "react-lazy-load-image-component";
import Gallery from "../../components/Gallery";
import AddPeopleScreen from "../../components/AddPeopleScreen";
import ContentLoader from "react-content-loader";

export default function EventIOS ({}) {

	const eventId = Router.query.eventId;
	const [loaded, setLoaded] = useState(false);

	const [event, setEvent] = useState(null);

	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");

	const [updatingPeople, setUpdatingPeople] = useState(false);


	useEffect(() => {

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
				HTTPClient("/media/"+response.data.event.cover+"?snapshot=true").then(res => setPlaceholder(res.data))
					.catch(err => {});
				HTTPClient("/media/"+response.data.event.cover+"?thumbnail=true").then(res => setUri(res.data))
					.catch(err => {});
			})
			.catch((error) => {
				// window.location.href = "/main_ios";
			});

	}, []);

	const updatingPeopleCallback = async (people) => {

		const addedPeople = [];
		const removedPeople = [];

		people?.forEach(person => {
			if(!event?.people.find(oldPerson => oldPerson._id.toString() === person._id.toString())) {
				if(!event?.people.find(oldPerson => oldPerson?.phoneNumber === person?.phoneNumber)) {
					addedPeople.push(person);
				}
			}
		});

		event?.people.forEach(person => {
			console.log("finder", person, (people?.find(newPerson => newPerson._id.toString() === person._id.toString())), (people?.find(newPerson => newPerson._id === person._id)))
			if(!(people?.find(newPerson => newPerson._id === person._id))?._id) {
				removedPeople.push(person);
			}
		});

		HTTPClient("/events/"+event._id+"/people", "PUT", {
			addedPeople: addedPeople.map(person => ({...person, status: undefined})),
			removedPeople: removedPeople.map(person => ({...person, status: undefined})),
		}).then(async res => {
			setUpdatingPeople(false);
			const {data: {event}} = await HTTPClient("/events/"+eventId, "GET");
			setEvent(event);
		}).catch(err => {
			console.log(err);
		});


	}

	return (
		<IOS buttons={[
			{
				icon: "leftArrow",
				href: "/main_ios",
				position: "left"
			},
			{
				icon: "events",
				href: "/event/"+event?._id+"/fullview",
				position: "right"
			}
		]} timestackButtonLink={"./"+event?._id+"/upload"}>
			{!loaded ? <div className={"container"}>
				{updatingPeople
					? <div className={"col-12"}>
						<AddPeopleScreen
							eventId={eventId}
							currentInvitees={event?.people}
							callback={updatingPeopleCallback}
						/>
					</div> :
					(<FadeIn>
						<FadeIn transitionDuration={50} >
							<div className={" row"}>
								<div className={"col-5"} autofocus={true}>
									<div style={{
										backgroundImage: event?.buffer ? `url(data:image/jpeg;base64,${event?.buffer})` : `url(${placeholder})`,
										backgroundSize: "cover",
										backgroundRepeat: "no-repeat",
										backgroundPosition: "center",
										borderRadius: "15px 15px 15px 15px",
										height: "200px",
									}}>
										<img

											src={uri}
											effect="blur"
											loading={"lazy"}
											style={{
												borderRadius: "15px",
												objectFit: "cover",

												// "backgroundSize":"contain","backgroundRepeat":"no-repeat"
											}}
											alt={""}
											width={"100%"} height={"200px"}
										/>
									</div>
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
								<img onClick={() => setUpdatingPeople(true)} style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
								{event?.people.map((invitee, index) => {
									return <img key={index} style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
								})}

							</div>
						</FadeIn>


						<br/>
						<div className={"row"}>
							<Gallery gallery={event?.media}/>
						</div>
						<br/>
						<br/>
					</FadeIn>)
				}
			</div> : <div className={"container row"}>

				<div className={"col-5"} autofocus={true}>
					<ContentLoader viewBox="0 0 100 300" height={200} width={300} >
						<rect x="0" y="0" rx="10" ry="0" width="100%" height="100%" />
					</ContentLoader>
				</div>


				<div className={"col-12"}>
					<ContentLoader
						width={"100%"}
						height={"100%"}
						viewBox="0 0 800 575"
						backgroundColor="#f3f3f3"
						foregroundColor="#ecebeb"
					>
						<rect x="12" y="58" rx="2" ry="2" width="33%" height="211" />
						<rect x="240" y="57" rx="2" ry="2" width="33%" height="211" />
						<rect x="467" y="56" rx="2" ry="2" width="33%" height="211" />
						<rect x="12" y="283" rx="2" ry="2" width="33%" height="211" />
						<rect x="240" y="281" rx="2" ry="2" width="33%" height="211" />
						<rect x="468" y="279" rx="2" ry="2" width="33%" height="211" />

					</ContentLoader>
				</div>

			</div> }
		</IOS>
	);
}