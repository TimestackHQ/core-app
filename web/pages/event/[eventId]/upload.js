import React, {Fragment, useEffect, useState} from 'react';
import * as _ from "lodash"
import IOS from "../../../components/ios";
import FadeIn from "react-fade-in";
import Router, {useRouter} from "next/router";
import HTTPClient from "../../../utils/httpClient";
import {LazyLoadImage} from "react-lazy-load-image-component";
import AddPeopleScreen from "../../../components/AddPeopleScreen";
import moment from "moment/moment";
import MediaView from "../../../components/MediaView";

export default function EventIOS ({}) {

	const router = useRouter();
	const eventId = router.query.eventId;
	const [event, setEvent] = useState(null);
	const [uri, setUri] = useState("");


	const [greaterThanOrEqual, setGreaterThanOrEqual] = useState(moment().toDate());
	const [uploadedMedia, setUploadedMedia] = useState([]);
	const [updatingPeople, setUpdatingPeople] = useState(false);
	const [uploadingMedia, setUploadingMedia] = useState(false);
	const [mediaCount, setMediaCount] = useState(null);

	useEffect(() => {
		HTTPClient("/media/"+event?.cover+"?thumbnail=true").then(res => setUri(res.data))
			.catch(err => {});
	}, [event])

	useEffect(() => {

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
				setMediaCount(response.data.event?.mediaCount)
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
		setUploadingMedia(true);
	}

	window.addEventListener("message", async messageRaw => {
		try {
			const message = JSON.parse(messageRaw.data);
			if (message.response === "uploadMedia") {
				setTimeout(async () => {
					const res = await HTTPClient("/media/"+eventId+"/new?gte="+greaterThanOrEqual, "GET");
					setUploadedMedia(_.uniq(res.data.media));
					setMediaCount(res.data.mediaCount);
				}, 1000);
			}
			else if (message.response === "mediaLength") {
			}
			else if (message.response === "uploadMediaDone") {
				setUploadingMedia(false);
			}
		} catch (e) {
		}

	});


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
				<br/>
				<br/>
				<br/>
				<div className={"container"} >
					{updatingPeople ? <div className={"row card"} style={{
						boxShadow: "rgba(100, 100, 111, 0.5) 0px 10px 50px 0px",
						borderRadius: "3rem",
						borderBottomRightRadius: "0px",
						borderBottomLeftRadius: "0px",
						padding: 0
					}}>

						<div className={"card-body"} style={{paddingBottom: 0, paddingLeft: 30, paddingRight: 30}}>
							<FadeIn>

								<AddPeopleScreen
									eventId={eventId}
									currentInvitees={event?.people}
									callback={updatingPeopleCallback}
								/>
							</FadeIn>
						</div>

					</div>
						: <div className="row">
						<div className={"card"} style={{
							boxShadow: "rgba(100, 100, 111, 0.5) 0px 10px 50px 0px",
							borderRadius: "3rem",
							borderBottomRightRadius: "0px",
							borderBottomLeftRadius: "0px",
							padding: 0
						}}>
							<FadeIn>

								<div className={"card-body"} style={{paddingBottom: 0, margin: 0}}>
									<div className={"row"} style={{margin: "0.5rem", paddingTop: "10px", paddingLeft: 1, paddingRight: 1}}>

										<div className={"col-6"} >
											<h1>
												<b>Upload</b>
											</h1>
										</div>
										<div className={"col-6 text-end"} onClick={() => Router.back()}>
											<img src={"/icons/x.svg"} width={"20px"}/>
										</div>
									</div>
									<br/>
									<div className={"row"} autofocus={true} style={{margin: 0}}>
										<div className={"col-3"}>
											<LazyLoadImage
												src={uri}
												style={{borderRadius: "15px", objectFit: "cover"}}
												alt={""}
												width={"80px"} height={"120px"}
											/>
										</div>
										<div className={"col-8"}>
											<h6 style={{marginBottom: "0px"}}>{event?.name} {uploadingMedia ? <i style={{color: "blue"}} className="fas fa-circle-notch fa-spin"></i> : null}</h6>
											<p style={{color: "gray"}}>{event?.location}</p>
											{/*{mediaLength && (mediaLength !== uploadedCount && mediaLength !== 0) ? <div style={{color: "blue"}}>*/}
											{/*	<i className="fas fa-circle-notch fa-spin"></i> {mediaLength !== "loading" && mediaLength ? `Uploading ${uploadedCount}/${mediaLength}` : null}*/}
											{/*</div> : null}*/}
										</div>
										<div className={"col-12"}>
											<br/>
											<div style={{}}>
												<img onClick={() => setUpdatingPeople(true)} style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
												{event?.people.map((invitee, index) => {
													return <img key={index} style={{width: "45px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
												})}

											</div>
										</div>
										<div style={{color: "gray", fontSize: 13}} className={"col-12"}>
											<hr style={{marginBottom: 10}}/>
											{mediaCount} memories
											<br/>
										</div>
									</div>
									<br/>

									<div style={{paddingTop: 0, marginTop: 0}} className={"row"}>
										<div className={"col-4"} style={{margin: 0, paddingLeft: 1, paddingRight: 1, height: "200px", padding: 0}}>

											<img onClick={upload} style={{objectFit: "cover", margin: 0, padding: 0}} alt={"Cassis 2022"} height={"200px"} width={"100%"} src={"/images/add-media.png"}/>
										</div>
										{uploadedMedia?.map((mediaId, index) => {
											return <div key={index} className={"col-4"} style={{margin: 0, paddingLeft: 1, paddingRight: 1, height: "200px", padding: 0}}>
												<MediaView publicId={mediaId} />

											</div>
										})}
										<div style={{display: "flex",
											flexDirection: "column",
											height: "50vh"}} />
									</div>

								</div>
								<br/>


							</FadeIn>
						</div>
					</div>}

				</div>
		</IOS>
	);
}