import { useRouter } from 'next/router'
import Navbar from "../../../components/Navbar";
import HTTPClient from "../../../utils/httpClient";
import {Fragment, useEffect, useState} from "react";
import {Prediction as Draft} from "../../../utils/prediction";
import moment from "moment";
import FadeIn from "react-fade-in";
import {zh} from "chrono-node";
import Joi from "joi";
import {PhoneNumberValidator} from "../../../utils/validator";
import Link from "next/link";
import PeopleList from "../../../components/PeopleList";
import AvailabilityRate from "../../../components/AvailabilityRate";

export default function Event () {
	const router = useRouter()
	const { eventId } = router.query;

	const [event, setEvent] = useState(null);
	const [initialAvailabilities, setInitialAvailabilities] = useState([]);
	const [prompt, setPrompt] = useState("");
	const [contactPrompt, setContactPrompt] = useState("");
	const [timeRanges, setTimeRanges] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [responded, setResponded] = useState(false);
	const [selectedAvailability, setSelectedAvailability] = useState(null);

	const addContact = () => {
		if(!Joi.string().email({ tlds: { allow: false } }).validate(contactPrompt).error) {
			setContacts([...contacts, {anchor: contactPrompt}]);
		}else if(!PhoneNumberValidator().validate("+1"+contactPrompt).error) {
			setContacts([...contacts, {anchor: contactPrompt}]);
		}
	}


	const getImage = person => {
		if(person === "mingxi@moddel.world") return "/images/mingxi.jpg";
		else if (person === "achraf@moddel.world") return "../../images/achraf.jpeg";
		return "images/default.png";
	}

	useEffect(() => {
		HTTPClient(`/events/${eventId}`, "GET")
			.then((res) => {
				setEvent(res.data);
				setInitialAvailabilities(res.data.availabilities.map((availability) => availability._id));
			})
			.catch((err) => {
				console.log(err);
			})
	}, [eventId]);

	const confirmEvent = () => {

		const {start, end} = event.availabilities.find(availability => availability._id === selectedAvailability);



		HTTPClient(`/events/${event._id}/confirm`, "POST", {
			start,
			end
		}).then((res) => {
			console.log(res);
			console.log(event?.availabilities.find(a => !a.selected));
			setResponded(true);
		}).catch((err) => {
			console.log(err);
		})
	}


	return <div>
		<Navbar/>
		<FadeIn className={"container"}>
			<div className="col-lg-9 mx-auto p-3 py-md-5">
				{responded ? <div className={"card border-rounded"}>
					<div className={"card-body row"}>
						<div className={"text-center"}>
							<br/>
							<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M34.1 58.2L62.4 29.9L57.8 25.4L34.1 49.1L22.1 37.1L17.6 41.6L34.1 58.2ZM40 80C34.5333 80 29.3667 78.95 24.5 76.85C19.6333 74.75 15.3833 71.8833 11.75 68.25C8.11667 64.6167 5.25 60.3667 3.15 55.5C1.05 50.6333 0 45.4667 0 40C0 34.4667 1.05 29.2667 3.15 24.4C5.25 19.5333 8.11667 15.3 11.75 11.7C15.3833 8.1 19.6333 5.25 24.5 3.15C29.3667 1.05 34.5333 0 40 0C45.5333 0 50.7333 1.05 55.6 3.15C60.4667 5.25 64.7 8.1 68.3 11.7C71.9 15.3 74.75 19.5333 76.85 24.4C78.95 29.2667 80 34.4667 80 40C80 45.4667 78.95 50.6333 76.85 55.5C74.75 60.3667 71.9 64.6167 68.3 68.25C64.7 71.8833 60.4667 74.75 55.6 76.85C50.7333 78.95 45.5333 80 40 80Z" fill="#86DE84"></path>
							</svg>
							<br/>
							<br/>
							<h4 className={"text-left"}>Event confirmed ! We notified attendies</h4>
							<h3>{event.name}</h3>

						</div>
					</div>
				</div> : <div className={"card border-rounded"}>
					<div className={"card-body row"}>
						<h1>Confirmation: {event?.name}</h1>
						<div className={"col-12"}>
							<h4 className={"day-name"}>Proposed by  <img style={{border: "1px solid black", borderRadius: "5px"}} width={"25px"} src={"/images/achraf.jpeg"}/> you</h4>
						</div>
						<hr/>
						<div className={"col-4"}>
							<h4>People</h4>
							<PeopleList people={event?.people} event={event}/>
						</div>
						<div className={"col-8"}>
							<h4>Availabilities</h4>

								{event?.availabilities.sort((a, b) => moment(a.start).unix() - moment(b.start).unix()).map((availability, i) => {

									return (
										<FadeIn key={i}>
											<div className={"card  border-rounded"} style={{borderColor: "black", borderWidth: "1px"}}>
												<div className={"card-body  row"} >
													<div className={"col-7"}>
														<h6><b>{moment(availability.start).format("ddd, MMMM Do YYYY, h:mm a")}</b> to {moment(availability.end).format("h:mm a")}</h6>
													</div>
													<div className={"col-5"}>
														{
															selectedAvailability === availability._id ? <button style={{width: "100%"}} className={"btn btn-success btn-block"} ><i className="fa-solid fa-check"></i> Selected</button> :
																<button onClick={() => setSelectedAvailability(availability._id)} style={{width: "100%"}} className={"btn btn-outline-secondary btn-block"}>Select</button>
														}
													</div>
													<AvailabilityRate users={event.users} availability={availability}/>
												</div>
											</div>
											<br/>
										</FadeIn>
									)
								})}
							<br/>
							{/*<input className={"form-control"} type={"datetime-local"}/>*/}

						</div>
						<div className={"col-5"}>
							<Link style={{width: "100%"}} className={"btn btn-lg btn-outline-secondary btn-block"} href={"../" + event?._id}>Edit</Link>
						</div>
						<div className={"col-7"}>
							{selectedAvailability ? <div>
								<button onClick={confirmEvent} style={{width: "100%"}} className={"btn btn-lg btn-primary btn-block"}>
									<i className="fa-solid fa-circle-check"></i> Send
								</button>
								<FadeIn>
									<hr/>
									<h6>When the event is confirmed, people will receive email and text message confirmations</h6>
								</FadeIn>

							</div>: <button style={{width: "100%"}} className={"btn btn-lg btn-primary btn-block disabled"}>
								<i className="fa-solid fa-circle-check"></i> Send
							</button>}
						</div>
					</div>
				</div>}
			</div>


		</FadeIn>
	</div>
}