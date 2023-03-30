import FadeIn from "react-fade-in";
import HTTPClient from "../utils/httpClient";
import React, {useEffect} from "react";
import Image from "next/image";
import {CleanUpPhoneNumber} from "../utils/phoneNumber";
import ProfilePicture from "./ProfilePicture";

export default function AddPeopleScreen ({currentInvitees, sharelink, callback}) {

	const [search, setSearch] = React.useState(null);
	const [localContacts, setLocalContacts] = React.useState([]);
	const [users, setUsers] = React.useState([]);

	const [invitees, setInviteesRaw] = React.useState(currentInvitees);

	const setInvitees = (invitees) => {
		setInviteesRaw(Array.from(new Set(invitees)).sort((a, b) => b?.username));
	}

	useEffect(() => {
		window.ReactNativeWebView?.postMessage(JSON.stringify({
			request: "allContacts",
		}));
	}, []);

	window?.addEventListener("message", messageRaw => {
		try {
			const message = messageRaw?.data ? JSON.parse(messageRaw?.data) : null;
			if(message.response !== "allContacts") return;
			try {
				setLocalContacts(message.data);
			}catch(err){

			}
		} catch (err) {
			console.log(err);
		}

	});

	useEffect(() => {
		HTTPClient("/people?q=" + search, "GET")
			.then(res => {
				setUsers(res.data.people);
			})
	}, [search]);

	return (
		<div className={"container"}>
			<br/>
			<br/>
			<div className="row">
				<div className={"card "} style={{
					marginTop: -30,
					padding: 0
				}}>


						<FadeIn>

							<div className={"row"} style={{margin: "0px"}}>
								<div className={"col-10"} style={{marginBottom: "10px"}}>
									<h2>
										<b>People</b>
									</h2>
								</div>

								<div className={"col-2 text-right"}>
									<div onClick={() => {
										callback(invitees.map(invitee => invitee._id));
									}}>
										<Image src={"/icons/times.svg"} width={20} height={20} alt={""}/>
									</div>
								</div>

								<div className={"col-8"} style={{marginRight: "0px"}}>
									<button
										style={{
											width: "105%",
											borderRadius: "2rem",
											backgroundColor: "#2E8EFF",
											borderColor: "#2E8EFF"
										}}
										className={"btn btn-primary"}
										onClick={() => window.ReactNativeWebView?.postMessage(JSON.stringify({
											request: "shareLink",
											link: sharelink
										}))}
									>
										<img src={"/icons/share.svg"} width={"20px"} style={{marginBottom: "4px"}}/> <b>Share</b>
									</button>
								</div>

								<div className={"col-4"}>
									<button style={{width: "100%", borderRadius: "2rem", backgroundColor: "#E41E1E"}} className={"btn btn-danger"}><b>Disable</b></button>
								</div>


								<div className={"col-12"}>
									<br/>
									<div className="input-group">
										<input
											className={"form-control"}
											style={{backgroundColor: "#EFEFF0", borderRadius: "12px", marginTop: "3px"}}
											type="text"
											name={"search"}
											onChange={e => setSearch(e.target.value)}
											placeholder="Search"
											aria-label="Search"
											value={search}
											autoFocus={true}
										/>
										<button onClick={() => setSearch("")} type="button" className="btn bg-transparent"
										        style={{marginLeft: "-40px", "z-index": 100, color: "gray"}}>
											<i className="fa fa-times-circle"></i>
										</button>

									</div>
									<hr style={{marginBottom: 0}}/>
									{search ? <p>Timestack results</p> : <p style={{color: "gray", paddingTop: "0px"}}>0 people, {invitees.length} pending</p>}

									{!search ? invitees.map((invitee, index) => {
										const isInvitee = invitees.map(invitee => invitee?._id).includes(invitee._id);
										return (
											<div key={index} className={"row"} onClick={() => {
												if (isInvitee) {
													setInvitees(invitees.filter(row => row._id !== invitee._id));
												} else {
													setInvitees([...invitees, invitee]);
												}
											}}>
												<div className={"col-3"}>
													<ProfilePicture
														width="50px"
														height="50px"
														location={invitee?.profilePictureSource}
													/>
												</div>
												<div className={"col-7"} style={{paddingLeft: "0px"}}>
													<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>
														{invitee.firstName ? invitee?.firstName : invitee?.name} {invitee.lastName ? invitee?.lastName : invitee?.name}

													</b></h5>
													<p style={{color: "gray", marginBottom: "0px"}}>
														{invitee?.username ? "@" + invitee?.username : null}
														{invitee?.phoneNumber ? invitee?.phoneNumber : null}
													</p>
												</div>
												<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													{invitee?.status === "pending" || invitee?.status === "notUser" ? <i style={{color: "orange"}} className={"fa fa-question-circle"}/> : null}
												</div>
												<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													{isInvitee ? <i className={"fa fa-circle-check"}/> : <i className={"fa fa-circle-o"}/>}
												</div>
												<span style={{marginBottom: "8px"}}/>
											</div>
										)
									}) : null}
									{currentInvitees.filter(current => !invitees.map(i => i._id).includes(current._id)).map((invitee, index) => {
										const isInvitee = invitees.map(invitee => invitee?._id).includes(invitee._id);
										return (
											<div key={index} className={"row"} onClick={() => {
												if (isInvitee) {
													setInvitees(invitees.filter(row => row._id !== invitee._id));
												} else {
													setInvitees([...invitees, invitee]);
												}
											}}>
												<div className={"col-3"}>
													<ProfilePicture
														width="40px"
														height="40px"
														style={{borderRadius: "60px", marginRight: "5px"}}
														location={invitee?.profilePictureSource}
													/>
												</div>
												<div className={"col-7"} style={{paddingLeft: "0px"}}>
													<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>
														{invitee.firstName ? invitee?.firstName : invitee?.name} {invitee.lastName ? invitee?.lastName : invitee?.name}

													</b></h5>
													<p style={{color: "gray", marginBottom: "0px"}}>
														{invitee?.username ? "@" + invitee?.username : null}
														{invitee?.phoneNumber ? invitee?.phoneNumber : null}
													</p>
												</div>
												<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													{invitee?.status === "pending" || invitee?.status === "notUser" ? <i style={{color: "orange"}} className={"fa fa-question-circle"}/> : null}
												</div>
												<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													{isInvitee ? <i className={"fa fa-circle-check"}/> : <i className={"fa fa-circle-o"}/>}
												</div>
												<span style={{marginBottom: "8px"}}/>
											</div>
										)
									})}

									{users.map((user, index) => {
										const isInvitee = invitees.map(invitee => invitee?._id).includes(user._id)
										return (
											<div key={index} className={"row"} onClick={() => {
												if (isInvitee) {
													setInvitees(invitees.filter(invitee => invitee._id !== user._id));
												} else {
													setInvitees([...invitees, user]);
												}
											}}>
												<div className={"col-3"}>
													<ProfilePicture
														width="45px"
														height="45px"
														style={{borderRadius: "60px", marginRight: "5px"}}
														location={user?.profilePictureSource}
													/>
												</div>
												<div className={"col-8"} style={{paddingLeft: "0px"}}>
													<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>
														{user?.firstName ? user?.firstName : null} {user?.lastName ? user?.lastName : null}
													</b></h5>
													<p style={{color: "gray", marginBottom: "0px"}}>
														{user?.username ? "@" + user?.username : null}
													</p>
												</div>
												<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													{isInvitee ? <i className={"fa fa-circle-check"}/> : <i className={"fa fa-circle-o"}/>}
												</div>
												<span style={{marginBottom: "8px"}}/>
											</div>
										)
									})}

									{localContacts.filter(
										contact => {
											if(
												String(JSON.stringify(contact)).includes(search)
												// || String(JSON.stringify(c/**/ontact).replace(/\D/g,'')).includes(search?.replace(/\D/g,''))
												|| !search
											)
												return true
										}
									)
										.sort((a, b) => a?.name?.localeCompare(b?.name))
										.map((contact, index) => {

											const isInvitee =
												invitees.map(invitee => invitee?._id.toString()).includes(contact.id.toString()) ||
												invitees.map(invitee => CleanUpPhoneNumber(invitee?.phoneNumber)).includes(CleanUpPhoneNumber(contact?.phoneNumbers?.[0]?.number))
											return (
											<div key={index} className={"row"}>
												{index !== 0 ? null : <div className={"col-12"}>
													<hr/>
													<h6>Your phone contacts</h6>
												</div>}
												<div className={"col-8"} style={{paddingLeft: "15px"}}>
													<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>{contact?.name}</b></h5>
													<p style={{color: "gray", marginBottom: "0px"}}>{contact?.phoneNumbers?.[0]?.number}</p>
												</div>
												<div className={"col-4 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
													<button onClick={() => window.ReactNativeWebView?.postMessage(JSON.stringify({
														request: "shareLink",
														link: sharelink
													}))} style={{width: "90%"}} className={"btn btn-sm btn-outline-dark"}>
														Invite
													</button>
												</div>
												<span style={{marginBottom: "8px"}}/>

											</div>
										);
									})
									}


								</div>
							</div>


						</FadeIn>
				</div>
			</div>
		</div>
	);

}