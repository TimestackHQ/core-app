import React, {useEffect, useState, Fragment} from 'react';
import IOS from "../../components/ios";
import HTTPClient from "../../utils/httpClient";
import Router from "next/router";
import Gallery from "../../components/Gallery";
import AddPeopleScreen from "../../components/AddPeopleScreen";
import ContentLoader from "react-content-loader";
import {useSelector} from "react-redux";
import ProfilePicture from "../../components/ProfilePicture";
import {EventButtonAction, modalView, NativeNavigate} from "../../utils/nativeBridge";
import {Fade} from "@mui/material";
import FadeIn from "react-fade-in";
import {dateFormatter} from "../../utils/time";

export default function EventIOS ({}) {

	const eventId = Router.query.eventId;
	const user = useSelector(state => state.user);
	const [loaded, setLoaded] = useState(false);
	const [viewMenu, setViewMenu] = useState(false);

	const rawUploadQueue = useSelector(state => state.uploadQueue);
	const [event, setEvent] = useState(null);
	const [media, setMedia] = useState([]);
	const [uploadQueue, setUploadQueue] = useState([]);

	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");

	const [updatingPeople, setUpdatingPeople] = useState(true);


	const openUploadModal = () => {
		 NativeNavigate("Upload", {eventId: event?._id, event:event});
	}



	useEffect(() => {

		const fetchEvent = () => {
			HTTPClient("/events/"+eventId, "GET")
				.then((response) => {
					if(response.data.message === "joinRequired") {
						Router.push("/event/"+eventId+"/join");
					}else {

						const openModal = () => {
							setTimeout(() => {

								const searchURL = new URL(window.location.href);
								let searchParams = new URLSearchParams(searchURL.search);
								searchParams.set('openUpload', undefined);
								searchURL.search = searchParams.toString();
								window.history.replaceState(null, null, searchURL.toString());

								NativeNavigate("Upload", {eventId: response.data.event?._id, event:response.data.event})

							}, 1000);
						}

						setTimeout(() => {
							setEvent(response.data.event);
							setLoaded(true);

							let url = new URL(window.location.href);
							let searchParams = new URLSearchParams(url.search);
							let paramValue = searchParams.get('openUpload');

							if(paramValue === "true") {
								openModal();
							}
						})

						HTTPClient("/media/"+response.data.event.cover+"?snapshot=true").then(res => setPlaceholder(res.data))
							.catch(err => {});
						HTTPClient("/media/"+response.data.event.cover+"?thumbnail=true").then(res => setUri(res.data))
							.catch(err => {});



					}

				})
				.catch((error) => {
					// window.location.href = "/main_ios";
				});
		}

		fetchEvent();

		window?.addEventListener("message", messageRaw => {
			try {
				const message = messageRaw?.data ? JSON.parse(messageRaw?.data) : null;
				if(message.response === "modalDismissed") {
					try {
						fetchEvent();
					}catch(err){

					}
				}
			} catch (err) {
				console.log(err);
			}

		});

		window.onscroll = function (e) {
			setViewMenu(false);
		}



	}, []);

	useEffect(() => {
		// setUploadQueue(rawUploadQueue.filter(upload => upload?.eventId.toString() === event?._id.toString()));
	}, [event, rawUploadQueue])

	const updatingPeopleCallback = async (people) => {

		const add = people.filter(person => !event.people.map(p => p._id).includes(person));
		const remove = event.people
			.filter(person =>  !people.includes(person._id))
			.map(person => person._id);

		HTTPClient("/events/"+event._id+"/people", "PUT", {
			add, remove
		}).then(async res => {
			setUpdatingPeople(false);
			const {data: {event}} = await HTTPClient("/events/"+eventId, "GET");
			setEvent(event);
		}).catch(err => {
			console.log(err);
		});




	}


	return (
		<div style={{backgroundColor: "white", marginLeft: 0}}>

			{updatingPeople
				? <div className={"col-12"} style={{margin: 0, padding: 0}}>
					<AddPeopleScreen
						eventId={eventId}
						currentInvitees={event?.people}
						callback={updatingPeopleCallback}
						sharelink={window.location.protocol + "//" + window.location.host + "/event/" + event?.publicId+"/invite"}
					/>
				</div> :
				<Fragment>
					{loaded ? <div className={"container"}>

							<div style={{zIndex: 1, position: "fixed", bottom: 15, left: 15}}>
								<img onClick={() => setViewMenu(!viewMenu)} style={{marginRight: 10}} src={viewMenu ? "/icons/action_button_x.png" : "/icons/action_button.png"} height={43}/>
								{viewMenu ? <Fragment>
									<img onClick={() => {
										setUpdatingPeople(true);
										setViewMenu(false);
									}} style={{marginRight: 10}} src={"/icons/add_people.png"} height={43}/>
									<img onClick={() => {
										openUploadModal();
										setViewMenu(false);
									}} src={"/icons/add_upload.png"} height={43}/>
								</Fragment> : null}
							</div>
							<div className={"row"} style={{marginTop: 20}}>
								<div className={"col-5"} autofocus={true}>
									<div style={{
										backgroundImage: event?.buffer ? `url(data:image/jpeg;base64,${event?.buffer})` : `url(${placeholder})`,
										backgroundSize: "cover",
										backgroundRepeat: "no-repeat",
										backgroundPosition: "center",
										borderRadius: "15px",
										height: "200px",
										borderWidth: event?.buffer ? "0px" : "2px",
										borderStyle: "solid",
										borderColor: "black"
									}}>
										<img

											onClick={() => {
												NativeNavigate("Invite", {
													eventId: event._id,
													eventThumbnail: uri,
													eventName: event.name,
													eventLocation: event.location,
													eventStartsAt: event.startsAt,
													eventEndsAt: event?.endsAt,
													disabledAnimation: true
												})
											}}
											src={uri}
											effect="blur"
											loading={"lazy"}
											style={{
												borderRadius: "15px",
												objectFit: "cover",

												// "backgroundSize":"contain","backgroundRepeat":"no-repeat"
											}}
											// alt={"/images/thumbnail-filler.png"}
											width={"100%"} height={"200px"}
											alt={""}
										/>
									</div>
								</div>


								<div className={"col-7 position-relative"}>
									<div className="position-absolute top-0 start-0" style={{width: "100%",}}>
										<h3 style={{
											marginLeft: "2px",
											marginBottom: "0px",
											lineHeight: "1",
											overflowX: "hidden",
											maxHeight: "145px",
											overflowWrap: "break-word",
											width: "220px",
										}}><b>
											{event?.name}
										</b>
										</h3>
									</div>
									<div className="position-absolute bottom-0 start-0">
										<p style={{fontSize: "15px", marginBottom: "0px", marginLeft: "2px", marginTop: "10px"}}>{event?.location}</p>
										<p style={{fontSize: "15px", marginBottom: "0px", marginLeft: "2px", lineHeight: 1.2, width: "100%"}}>{dateFormatter(new Date(event.startsAt), event?.endsAt ? new Date(event?.endsAt) : null)}</p>
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
							<div className={"row flex-nowrap"} style={{position: "absolute", overflowX: "scroll", width: "100%", overflowY: "none", height: "80px", paddingBottom: "20px", marginTop: "-10px"}}>

								{event.people.map((user, index) => {
									return <div key={index} style={{display: "inline", paddingLeft: "10px",width: "55px"}}>
										<ProfilePicture width={"45px"} height={"45px"} location={user?.profilePictureSource}/>
									</div>
								})}

							</div>


							<br/>
							{uploadQueue.length !== 0 ? <h6><span style={{color: "green"}}> <i className="fas fa-circle-notch fa-spin"></i> {uploadQueue.length} remaining</span></h6>: null}

							<Gallery eventId={event?._id}/>
							<br/>
							<br/>
							<br/>
						</div> :


						<div style={{marginTop: 20}} className={"container"} onScroll={() => setViewMenu(false)}>

							<div className={"row"}>
								<div className={"col-5"} style={{height: "200px"}}>
									<ContentLoader height={"100%"} width={370}>
										<rect x="10" y="" rx="20" ry="10" width="35%" height="200px" />
									</ContentLoader>
									<br/>
									<br/>
									<br/>
								</div>
								<div className={"col-7 position-relative"}>
									<div className="position-absolute top-0 start-0">
										<h2 style={{marginLeft: "2px", marginBottom: "0px", lineHeight: "1", maxHeight: "52px"}}><b>{Router.query?.name}</b></h2>
									</div>
									<div className="position-absolute bottom-0 start-0">
										<p style={{fontSize: "15px", marginBottom: "0px", marginLeft: "2px"}}></p>
										<p style={{fontSize: "15px", marginLeft: "2px"}}></p>
									</div>
								</div>


							</div>

							<br/>

							<div className={"row"}>
								<div className={"col-4 text-center"}>
									<h5 style={{margin: 0}}><br/></h5>
									<h5 style={{color: "gray"}}>People</h5>
								</div>

								<div className={"col-4 text-center"}>
									<h5 style={{margin: 0}}><br/></h5>
									<h5 style={{color: "gray"}}>Memories</h5>
								</div>

								<div className={"col-4 text-center"}>
									<h5 style={{margin: 0}}><br/></h5>
									<h5 style={{color: "gray"}}>Revisits</h5>
								</div>
							</div>

							<div style={{height: "5px"}}/>

							<ContentLoader
								width={500}
								height={100}
								backgroundColor="#f3f3f3"
								foregroundColor="#ecebeb"
								style={{marginLeft: "0"}}
							>
								<circle cx="26" cy="40" r="23" />
								<circle cx="80" cy="40" r="23" />
								<circle cx="134" cy="40" r="23" />
								<circle cx="188" cy="40" r="23" />
								<circle cx="242" cy="40" r="23" />

							</ContentLoader>

						</div>


					}
				</Fragment>
			}
		</div>
	);
}