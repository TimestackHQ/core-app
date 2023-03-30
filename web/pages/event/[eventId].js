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
			HTTPClient("/events/"+eventId+"?noBuffer=true", "GET")
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

	useEffect(() => {
		if(!updatingPeople) {
			NativeNavigate("Event", {eventId: event?._id, event:event});
		}
	}, [updatingPeople])

	// <Main
	// baseRoute={"/event/"+route.params.eventId+"?id="+id+"&name="+route.params.eventName+"&openUpload="+route.params.openUpload}
	// apiUrl={apiUrl}
	// frontendUrl={frontendUrl}
	// navigation={navigation}
	// />

	return (
		<div style={{backgroundColor: "white", marginLeft: 0}}>

			{updatingPeople && loaded
				? <div className={"col-12"} style={{margin: 0, padding: 0}}>
					<AddPeopleScreen
						eventId={eventId}
						currentInvitees={event?.people}
						callback={updatingPeopleCallback}
						sharelink={window.location.protocol + "//" + window.location.host + "/event/" + event?.publicId+"/invite"}
					/>
				</div> :
			null
			}
		</div>
	);
}