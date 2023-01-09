import { useRouter } from 'next/router'
import Navbar from "../../components/Navbar";
import HTTPClient from "../../utils/httpClient";
import {Fragment, useEffect, useState} from "react";
import {Prediction as Draft} from "../../utils/prediction";
import moment from "moment";
import FadeIn from "react-fade-in";
import {zh} from "chrono-node";
import Joi from "joi";
import {PhoneNumberValidator} from "../../utils/validator";
import CalendarView from "../../components/CalendarView";
import {useSelector} from "react-redux";
import Link from "next/link";
import AvailabilityMetric from "../../components/AvailabilityMetric";
import PeopleList from "../../components/PeopleList";
import AvailabilityRate from "../../components/AvailabilityRate";

export default function Event () {
	const router = useRouter()
	const { eventId } = router.query;
	const user = useSelector(state => state.user);


	const [event, setEvent] = useState(null);
	const [prompt, setPrompt] = useState("");
	const [contactPrompt, setContactPrompt] = useState("");
	const [timeRanges, setTimeRanges] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [responded, setResponded] = useState(false);

	const addContact = () => {
		if(!Joi.string().email({ tlds: { allow: false } }).validate(contactPrompt).error) {
			setContacts([...contacts, {anchor: contactPrompt}]);
		}else if(!PhoneNumberValidator().validate("+1"+contactPrompt).error) {
			setContacts([...contacts, {anchor: "+1"+contactPrompt}]);
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
			})
			.catch((err) => {
				console.log(err);
			})
	}, [eventId]);

	const processPrompt = e => {
		e.preventDefault();
		setTimeRanges([...timeRanges, ...Draft(prompt).timeRanges].sort((a, b) => a.start - b.start));
		setPrompt("");
	}

	const sendResponse = () => {
		const selectedAvailabilities = event.availabilities
			.filter((availability) => availability.selected)
			.map((availability) => availability._id);

		HTTPClient(`/events/${event._id}/respond`, "POST", {
			newAvailabilities: timeRanges.map((timeRange) => ({
				start: timeRange.start,
				end: timeRange.end,
			})),
			selectedAvailabilities,
			contacts,
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
							<h4 className={"text-left"}>Response sent !</h4>
							<h3>{event.name}</h3>

						</div>
					</div>
				</div> : <div className={"card border-rounded"}>
					<div className={"card-body row"}>
						<h1>{event?.name}</h1>
						<div className={"col-12"}>
							<h4 className={"day-name"}>Proposed by <img style={{border: "1px solid black", borderRadius: "5px"}} width={"25px"} src={"/images/default.png"}/> {event?.createdBy._id === user?._id  ? "you" : event?.createdBy.firstName}</h4>
						</div>
						<hr/>
						<div className={"col-4"}>
							<h4>People</h4>
							<PeopleList people={event?.people} event={event}/>
							{
								contacts.map((contact, i) => (
									<h6 key={i} className={"ml-2"}>
										<img style={{border: "1px solid black", borderRadius: "5px"}} width={"25px"} src={"/images/default.png"}/> {contact.anchor}
									</h6>
								))
							}
							<form onSubmit={e => {
								e.preventDefault();
								addContact(contactPrompt);
								setContactPrompt("");
							}} className={"input-group mb-3"}>
								<input value={contactPrompt} onChange={e => setContactPrompt(e.target.value)} type="text" className="form-control" placeholder="Add a person" aria-label="Add a person" aria-describedby="button-addon2"/>
								<button className="btn btn-outline-secondary" type="submit" id="button-addon2">Add</button>
							</form>
						</div>
						<div className={"col-8"}>
							<div className={"card result-card-body"}>
								<div className={"card-body "}>
								<h4>Timeslots</h4>
								<div className={"col-12"}>
									<form onSubmit={processPrompt} className="input-group mb-3">

										<input autoFocus={true} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={"Add timeslots"} className={"form-control"}/>
										<button type={"submit"} className={"btn btn-outline-secondary btn-block"}>Add</button>
									</form>
								</div>
								<div className={"col-12"}>
									{Draft(prompt).timeRanges.map((day, i) => (
										<h6 key={i}>
											<b>{moment(day?.start).format("ddd, MMM Do")}:</b> {moment(day?.start).format("LT")} to {moment(day?.end).format("LT")}


										</h6>
									))}
								</div>
								<hr/>
								<ul className="nav nav-tabs" id="pills-tab" role="tablist">
									<li className="nav-item" role="presentation">
										<button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill"
										        data-bs-target="#pills-home" type="button" role="tab"
										        aria-controls="pills-home" aria-selected="true">List
										</button>
									</li>
									<li className="nav-item" role="presentation">
										<button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
										        data-bs-target="#pills-profile" type="button" role="tab"
										        aria-controls="pills-profile" aria-selected="false">Visual
										</button>
									</li>
								</ul>
								<div className="tab-content" id="pills-tabContent">
									<div className="tab-pane fade show active" id="pills-home" role="tabpanel"
									     aria-labelledby="pills-home-tab">

										<br/>
											{timeRanges?.map((availability, i) => (
											<FadeIn key={i}>
												<div className={"card  border-rounded"} style={{borderColor: "black", borderWidth: "1px"}}>
													<div className={"card-body  row"} >
														<div className={"col-7"}>
															<h6><b>{moment(availability.start).format("ddd, MMMM D, h:mm a")}</b> to {moment(availability.end).format("h:mm a")}</h6>
														</div>
														<div className={"col-5"}>
															<button onClick={
																() => setTimeRanges(timeRanges.filter(time => time !== availability))
															} style={{width: "100%"}} className={"btn btn-primary btn-block btn-selected"}>
																<i className="fa-solid fa-check"></i></button>
														</div>
													</div>
												</div>
												<br/>
											</FadeIn>
										))}

											{timeRanges?.length === 0 && event?.availabilities.filter(e => e.selected).length === 0 ? null : <Fragment>
											<h5>People&apos;s timeslots</h5>
											{event?.availabilities.sort((a, b) => moment(a.start).unix() - moment(b.start).unix()).map((availability, i) => {
												const toggle = () => setEvent({
													...event,
													availabilities: event.availabilities.map((availability, j) => {
														if (i === j) {
															return {
																...availability,
																selected: !availability.selected
															}
														}
														return availability
													})
												})
												return (
													<FadeIn key={i}>
														<div className={"card  border-rounded"} style={{borderColor: "black", borderWidth: "1px"}}>
															<div className={"card-body  row"} >
																<div className={"col-7"}>
																	<h6><b>{moment(availability.start).format("dddd, MMM Do")} {moment(availability.start).format("YYYY") === moment().format("YYYY") ? null : moment(availability.start).format("YYYY")} </b><br/>{moment(availability.start).format("h:mm A")} to {moment(availability.end).format("h:mm A")}</h6>
																</div>
																<div className={"col-5"}>
																	{
																		availability.selected ? <button style={{width: "100%"}} className={"btn btn-success btn-block btn-selected"} onClick={toggle} ><i className="fa-solid fa-check"></i></button> :
																			<button onClick={toggle} style={{width: "100%"}} className={"btn btn-outline-secondary btn-block"}>Select</button>
																	}
																</div>
																<AvailabilityRate users={event.users} availability={availability}/>
															</div>
														</div>
														<br/>
													</FadeIn>
												)
											})}

										</Fragment>}

									</div>
									{/*<div className="tab-pane fade" id="pills-profile" role="tabpanel"*/}
									{/*     aria-labelledby="pills-profile-tab">*/}
									{/*	<FadeIn><CalendarView/></FadeIn>*/}
									{/*</div>*/}
								</div>


								<br/>
								</div>
							</div>
							{/*<input className={"form-control"} type={"datetime-local"}/>*/}

						</div>
						{event?.createdBy._id === user._id ? <div className={"col-6 row"}>
							<div className={"col-6"}>
								<button style={{width: "100%"}} className={"btn btn-lg btn-outline-danger btn-block"}>Cancel</button>
							</div>
							<div className={"col-6"}>
								<Link href={"./confirm/"+event.publicId} style={{width: "100%"}} className={"btn btn-lg btn-success btn-block"}>Confirm</Link>
							</div>
						</div> : <div className={"col-6"}/>}
						<div className={"col-6"}>
							<button onClick={sendResponse} style={{width: "100%"}} className={"btn btn-lg btn-primary btn-block"}>
								<i className="fa-solid fa-circle-check"></i> Send
							</button>
						</div>
					</div>
				</div>}
			</div>


		</FadeIn>
	</div>
}