import Head from 'next/head'
import Image from 'next/image'
import {Fragment, useEffect, useState} from "react";
import moment from "moment";
import FadeIn from "react-fade-in";
import Navbar from "../components/Navbar";
import {Prediction as Draft} from "../utils/prediction";
import HTTPClient from "../utils/httpClient";
import AvailabilityRate from "../components/AvailabilityRate";
import EventRate from "../components/EventRate";
import Link from "next/link";


export default function Home() {

	const [prompt, setPrompt] = useState("");
	const [draft, setDraft] = useState({});
	const [lockNlp, setLockNlp] = useState(false);
	const [event, setEvent] = useState();
	const [networkInUse, setNetworkInUse] = useState(false);
	const [copied, setCopied] = useState(false);
	const [events, setEvents] = useState([]);

	useEffect(() => {
		HTTPClient("/events", "GET")
			.then(res => {
				setEvents(res.data);
			})
			.catch(err => {
				console.log(err);
			})
	}, []);


	useEffect(() => {
		if(!lockNlp) {
			const draft = Draft(prompt);
			draft.timeRanges = draft.timeRanges.filter(a => a?.start).map((timeRange) => {
				return {
					...timeRange,
					edit: false,
					nlp: true
				}
			});
			draft.contacts = draft.contacts.map((contact) => {
				return {
					anchor: String(Number(contact)).length === 10 ? "+1"+contact : contact,
					nlp: true
				}
			})
			setDraft(draft);
			setLockNlp(false);
		}
	}, [prompt]);

	useEffect(() => {
		setTimeout(() => {
			setCopied(false);
		}, 1000)
	}, [copied]);

	const getImage = person => {
		if(person === "mingxi@moddel.world") return "images/mingxi.jpg";
		else if (person === "achraf@moddel.world") return "images/achraf.jpeg";
		return "images/default.png";
	}



	const createEvent = () => {
		setNetworkInUse(true);
		HTTPClient("/events", "POST", {
			name: draft.name,
			availabilities: draft.timeRanges.map(range => {
				return {
					start: range.start,
					end: range.end
				}
			}),
			contacts: draft.contacts.map(contact => {
				return {
					anchor: contact.anchor
				}
			})
		}).then((res) => {
			setTimeout(() => {
				setEvent(res.data.event);
				setNetworkInUse(false)
			}, 2000);
		}).catch(err => {
			setNetworkInUse(false)
		})
	}

	return <Fragment>
		<Navbar/>
		{
			event ? <FadeIn>
					<div className="container">
						<br/>
						<br/>
						<br/>
						<div className="row justify-content-center">
							<div className={"col-10 align-self-center"}>
								<div className="card main-shadow border-rounded">
									<div className="card-body">

										<div className={"text-center"}>
											<br/>
											<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M34.1 58.2L62.4 29.9L57.8 25.4L34.1 49.1L22.1 37.1L17.6 41.6L34.1 58.2ZM40 80C34.5333 80 29.3667 78.95 24.5 76.85C19.6333 74.75 15.3833 71.8833 11.75 68.25C8.11667 64.6167 5.25 60.3667 3.15 55.5C1.05 50.6333 0 45.4667 0 40C0 34.4667 1.05 29.2667 3.15 24.4C5.25 19.5333 8.11667 15.3 11.75 11.7C15.3833 8.1 19.6333 5.25 24.5 3.15C29.3667 1.05 34.5333 0 40 0C45.5333 0 50.7333 1.05 55.6 3.15C60.4667 5.25 64.7 8.1 68.3 11.7C71.9 15.3 74.75 19.5333 76.85 24.4C78.95 29.2667 80 34.4667 80 40C80 45.4667 78.95 50.6333 76.85 55.5C74.75 60.3667 71.9 64.6167 68.3 68.25C64.7 71.8833 60.4667 74.75 55.6 76.85C50.7333 78.95 45.5333 80 40 80Z" fill="#86DE84"></path>
											</svg>
											<br/>
											<br/>
											<h4 className={"text-left"}>Sent !</h4>
											<h3>{event.name}</h3>

										</div>

										<div className={"card"} onClick={() => {
											navigator.clipboard.writeText(event.link)
											setCopied(true)
										}} style={{borderColor: "black", borderRadius: "1rem"}}>
											<div className={"card-body btn btn-outline"}>
												<h5>{event.link} <img style={{
													position: "absolute",
													right: 10,
													marginRight: 10,
												}} src={"images/logo@timestack.svg"} width={"20px"} /></h5>

											</div>
										</div>
										{copied ? <h6 style={{color: "green"}}>Copied to clipboard</h6> : <br/>}
										<div className={"row"}>
											<div className={"col-6"}>
												<button style={{width: "100%"}} className={"btn save-button btn-lg btn-block"}>
													<i className={"fa fa-share"}/> View</button>
											</div>
											<div className={"col-6"}>
												<button style={{width: "100%"}} className={"btn send-button btn-lg btn-block"}>
													<i className={"fa fa-plus"}/> Add new event
												</button>

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</FadeIn>
			: networkInUse


				? <FadeIn>
					<div className="container">
						<br/>
						<br/>
						<br/>
						<div className="row justify-content-center">
							<div className={"col-10 align-self-center"}>
								<div className="card main-shadow border-rounded">
									<div className="card-body text-center">
										<img src="images/eventloader.gif" width={"100px"} className="img-fluid" alt="logo"/>
										<h5>Creating your event.</h5>
										<br/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</FadeIn>
				: <FadeIn>
				<div className="container">
					<br/>
					<br/>
					<br/>
					<div className="row justify-content-center">
						<div className={"col-10 align-self-center"}>
							<div>
							<textarea
								id={"prompt"}
								rows={1}
								className={"natural-language-main-input form-control main-shadow border-rounded"}
								placeholder={"Lunch with mingxi@moddel.world from 11 am to 1pm, tomorrow and on friday"}
								name={"prompt"}
								value={prompt}
								autoFocus={true}
								onChange={e => setPrompt(e.target.value)}
							/>
							</div>
							<br/>
							{draft.name || draft?.timeRanges?.length > 0 || draft?.contacts?.length > 0 ?
								<div className={"card main-shadow border-rounded"}>
									<FadeIn>
										<div className={"card-body"}>
											{/*<pre>*/}
											{/*	{JSON.stringify(draft, null, 2)}*/}
											{/*</pre>*/}
											<h4 style={{marginLeft: "1rem"}}>{draft.name}</h4>
											<div className={"card result-card-body"}>
												<div className={"card-body"}>

													<h3 style={{ marginLeft: "10px", marginBottom: "20px"}}>
														Timeslots
													</h3>
													{draft?.timeRanges?.map((day, index) => {

														const escape = () => setDraft({
															...draft,
															timeRanges: draft.timeRanges.map((timeRange, i) => {
																return {
																	...timeRange,
																	edit: false
																}
															})
														})
														return day.edit ? <div key={index} className={"row"} style={{margin:"0px", padding: "0px", borderCollapse: "collapse"}}>
															<form
																onSubmit={e => {
																	e.preventDefault();
																	const newText = e.target[0].value;
																	setPrompt(prompt.replace(day.text, newText));
																	escape();
																}}
																className="input-group"
																style={{
																	marginBottom: "10px",
																}}
															>
																<input
																	type="text"
																	className="form-control"
																	name={"newText"}
																	defaultValue={day.text}
																	autoFocus={true}
																	onKeyDown={e => {
																		if(e.key === "Escape") escape()
																	}}
																/>
																<button className="btn btn-outline-success" type="submit">Save</button>
																<button className="btn btn-outline-danger" onClick={escape} type="button" style={{borderBottomRightRadius: "1rem", borderTopRightRadius: "1rem"}}>Cancel</button>
															</form>
														</div> : (
															<div onDoubleClick={() => {
																setDraft({
																	...draft,
																	timeRanges: draft.timeRanges.map((timeRange, i) => {
																		if(i === index) return {
																			...timeRange,
																			edit: !timeRange.edit
																		}
																		return timeRange;
																	})
																})
															}} key={index} className={"row"} style={{margin:"0px", padding: "0px", borderCollapse: "collapse"}}>
																<div className={"col-6"}>
																	<h6 style={{marginTop: "5px"}} className={"day-name"}>{moment(day?.start).format("dddd, MMMM Do")}</h6>
																</div>
																<div className={"col-5"} style={{ marginTop: "5px"}}>
																	{moment(day.start).format("LT")} to {moment(day.end).format("LT")}
																</div>
																<div className={"col-1"}>
																	<button
																		style={{backgroundColor: "#EAEAEA"}}
																		className="d-inline-flex mb-3 px-2 py-1 border border-success border-opacity-10 day-number"
																		onClick={() => {
																			setDraft({
																				...draft,
																				timeRanges: draft.timeRanges.filter((timeRange, i) => i !== index)
																			})
																			setPrompt(prompt.replace(day.text, ""))
																		}
																		}>
																		<b>X</b>
																	</button>
																	<br/>

																</div>

															</div>
														)
													})?.sort((a, b) => b.start - a.start)}
													<form onSubmit={e => {

														e.preventDefault();
														setPrompt(prompt + " " + e.target[0].value);
														document.getElementById("morePrompt").value = "";
													}}>
														{draft.timeRanges?.length === 0 ? null : <input id={"morePrompt"} style={{borderRadius: "1rem"}} className={"form-control"} placeholder={"Add timeslot"} />}
													</form>
												</div>

											</div>
											<div style={{margin: "30px"}}/>
											<div className={"card result-card-body"}>
												<div className={"card-body"}>
													<h3 style={{ marginLeft: "10px", marginBottom: "20px"}}>
														People
													</h3>
													<div className={"row"} style={{margin:"0px", padding:0,    borderCollapse: "collapse"}}>

														{draft.contacts?.map((person, index) => (
															<Fragment key={index}>
																<div className={"col-11"}>
																	<h5 key={index} className={"day-name"}><img style={{border: "1px solid black", borderRadius: "5px"}} width={"25px"} src={getImage(person.anchor)}/> {person.anchor}</h5>
																</div>
																<div className={"col-1"}>
																	<button
																		style={{backgroundColor: "#EAEAEA"}}
																		className="d-inline-flex mb-3 px-2 py-1 border border-success border-opacity-10 day-number"
																		onClick={() => {
																			setDraft({
																				...draft,
																				contacts: draft.contacts.filter((contact, i) => i !== index)
																			})
																			setPrompt(prompt.replace(person.anchor, ""))
																		}
																		}>
																		<b>X</b>
																	</button>
																	<br/>
																</div>


															</Fragment>
														))}


													</div>
													<form onSubmit={e => {

														e.preventDefault();
														setPrompt(prompt + " " + e.target[0].value);
														document.getElementById("morePrompt2").value = "";
													}}>
														{draft.contacts?.length === 0 ? null : <input id={"morePrompt2"} style={{borderRadius: "1rem", marginTop: "10px"}} className={"form-control"} placeholder={"Add a contact"} />}
													</form>
												</div>
											</div>
											<div style={{margin: "10px"}}/>
											<div className={"card"} style={{borderWidth: "0px"}}>
												<div className={"card-body text-end"}>
													<button className={
														draft.name && draft.timeRanges.length > 0 && draft.contacts.length > 0 ? "btn btn-secondary btn-lg save-button" : "btn btn-secondary btn-lg save-button disabled"
													}><i
														className="fas fa-save"></i></button>
													<button className={
														draft.name && draft.timeRanges.length > 0 && draft.contacts.length > 0 ? "btn btn-secondary btn-lg send-button" : "btn btn-secondary btn-lg send-button disabled"
													}

													        onClick={createEvent}

													><i
														className="fas fa-paper-plane"></i> <b>Send</b></button>
												</div>

											</div>
										</div>
									</FadeIn>
								</div>
								: <FadeIn>
									<hr/>
									<div className={"col-6"}>

										<div className={"card result-card-body"}>
											<div className={"card-body"}>
												<div className={"row"}>
													<h5>Activity</h5>
														{events?.map((event, index) => (
															<FadeIn key={index}>
																<div key={index} className={"card result-card-body"} style={{borderWidth: "1px"}}>
																	<div className={"card-body "} style={{borderColor: "black"}}>
																		<Link style={{color: "black"}} href={"./event/"+event.publicId}><h5 className={"card-title"}>{event.name}</h5></Link>
																		{event.status === "confirmed" ? <h6 style={{color:"green"}} className={""}> <i className={"fas fa-check-circle"}/> Confirmed <br/> {moment(event.start).format("ddd, MMM Do, h:mm a")} - {moment(event.end).format("h:mm a")}</h6> : <h6 className={"card-subtitle mb-2 text-muted"}> <i className={"fas fa-clock"}/> Pending</h6>}
																		<EventRate total={event.totalUsersCount} responded={event.respondedUsersCount} />

																	</div>
																</div>
															</FadeIn>
														))}
														<br/>
												</div>
											</div>
										</div>
									</div>


								</FadeIn>}

						</div>
					</div>
				</div>
			</FadeIn>
		}
	</Fragment>

}
