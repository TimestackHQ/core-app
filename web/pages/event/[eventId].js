import {useEffect, useState, Fragment} from 'react';
import IOS from "../../components/ios";
import HTTPClient from "../../utils/httpClient";
import Router from "next/router";
import Gallery from "../../components/Gallery";
import AddPeopleScreen from "../../components/AddPeopleScreen";
import ContentLoader from "react-content-loader";
import {useSelector} from "react-redux";
import ProfilePicture from "../../components/ProfilePicture";

export default function EventIOS ({}) {

	const eventId = Router.query.eventId;
	const [loaded, setLoaded] = useState(false);

	const rawUploadQueue = useSelector(state => state.uploadQueue);
	const [event, setEvent] = useState(null);
	const [media, setMedia] = useState([]);
	const [uploadQueue, setUploadQueue] = useState([]);


	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");

	const [updatingPeople, setUpdatingPeople] = useState(false);


	useEffect(() => {

		const fetchEvent = () => {
			HTTPClient("/events/"+eventId, "GET")
				.then((response) => {
					if(response.data.message === "joinRequired") {
						Router.push("/event/"+eventId+"/join");
					}else {
						setTimeout(() => {
							setEvent(response.data.event);
							setLoaded(true);
						}, 0);

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


	}, []);

	useEffect(() => {
		// setUploadQueue(rawUploadQueue.filter(upload => upload?.eventId.toString() === event?._id.toString()));
	}, [event, rawUploadQueue])

	const updatingPeopleCallback = async (people) => {

		console.log(people, event.people);

		const add = people.filter(person => !event.people.map(p => p._id).includes(person));
		const remove = event.people
			.filter(person =>  !people.includes(person._id))
			.map(person => person._id);

		console.log(remove)

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
		<IOS buttons={[
			{
				icon: "leftArrow",
				href: "/main_ios",
				position: "left"
			},
			{
				icon: "share",
				href: window.location.protocol + "//" + window.location.host + "/event/" + event?._id+"/invite",
				position: "right",
				share: true
			}
		]} timestackButtonLink={{eventId: event?._id, event:event}}>
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

											onClick={() => {
												Router.push("/event/"+event?._id+"/join")}
											}
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
										<h2 style={{marginLeft: "2px", marginBottom: "0px", lineHeight: "1", maxHeight: "52px"}}><b>{event?.name}</b></h2>
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
								<img onClick={() => setUpdatingPeople(true)} style={{width: "45px", borderRadius: "25px"}} src={"/icons/add-people-icon.svg"}/>
								{event?.people.map((invitee, index) => {
									return <div key={index} style={{display: "inline", paddingLeft: "10px"}}>
										<ProfilePicture width={"45px"} height={"45px"} location={invitee?.profilePictureSource}/>
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


						<div className={"container"}>

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
		</IOS>
	);
}