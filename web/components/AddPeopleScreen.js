import FadeIn from "react-fade-in";
import HTTPClient from "../utils/httpClient";
import React, {useEffect} from "react";
import Image from "next/image";
import Router from "next/router";
import {CleanUpPhoneNumber} from "../utils/phoneNumber";

export default function AddPeopleScreen ({eventId, currentInvitees, callback}) {

	const [search, setSearch] = React.useState(null);
	const [localContacts, setLocalContacts] = React.useState([]);
	const [users, setUsers] = React.useState([]);

	const [invitees, setInviteesRaw] = React.useState(currentInvitees);

	const setInvitees = (invitees) => {
		setInviteesRaw(Array.from(new Set(invitees)).sort((a, b) => b?.username));
	}

	useEffect(() => {
		window.ReactNativeWebView?.postMessage(JSON.stringify({
			request: "uploadQueue",
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

		<FadeIn>
				<br/>
				<div className={"row"}>
					<div className={"col-10"}>
						<h3>
							<b>People</b>
						</h3>
						</div>
						<div className={"col-2 text-right"}>
							<div onClick={() => {
								callback(invitees.map(invitee => ({
									_id: invitee._id,
									username: invitee?.username,
									firstName: invitee?.firstName ? invitee?.firstName : invitee?.name.split(" ")[0],
									lastName: invitee?.lastName ? invitee?.lastName : invitee?.name.split(" ")[1],
								phoneNumber: invitee?.phoneNumber,
								email: invitee?.email,
								profilePictureSource: invitee?.profilePictureSource,
							})).filter(invitee => invitees.map(invitee => invitee?._id).includes(invitee._id)));
						}}>
							<Image src={"/icons/times.svg"} width={20} height={20} alt={""}/>
						</div>
					</div>

					<div className={"col-12"}>
						<div className="input-group">
							<input
								className={"form-control"}
								style={{backgroundColor: "#EFEFF0", borderRadius: "10px", marginTop: "3px"}}
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
										<img
											width="80%"
											style={{borderRadius: "60px", marginRight: "5px"}}
											src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}
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
										<img
											width="80%"
											style={{borderRadius: "60px", marginRight: "5px"}}
											src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}
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
										<img
											width="80%"
											style={{borderRadius: "60px", marginRight: "5px"}}
											src={user?.profilePictureSource ? user?.profilePictureSource : "/icons/contact.svg"}
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
								<div key={index} className={"row"} onClick={() => {
									if (isInvitee) {
										setInvitees(invitees.filter(invitee => invitee._id !== contact.id));
									} else {
										setInvitees([...invitees, {
											...contact,
											_id: contact.id,
											phoneNumber: contact?.phoneNumbers?.[0]?.number,
											email: contact?.emails?.[0]?.email,
										}]);
									}
								}}>
									{index !== 0 ? null : <div className={"col-12"}>
										<hr/>
										<h6>Your phone contacts</h6>
									</div>}
									<div className={"col-3"}>
										<img width="90%" style={{borderRadius: "60px", marginRight: "5px"}} src={"/icons/contact.svg"}/>
									</div>
									<div className={"col-8"} style={{paddingLeft: "0px"}}>
										<h5 style={{marginBottom: "0px", marginTop: "3px"}}><b>{contact?.name}</b></h5>
										<p style={{color: "gray", marginBottom: "0px"}}>{contact?.phoneNumbers?.[0]?.number}</p>
									</div>
									<div className={"col-1 align-items-center"} style={{paddingLeft: "0px", marginTop: "10px"}}>
										{isInvitee ? <i className={"fa fa-circle-check"}/> : <i className={"fa fa-circle-o"}/>}
									</div>
									<span style={{marginBottom: "8px"}}/>

								</div>
							);
						})
						}




						<br/><br/><br/><br/>

					</div>
				</div>


		</FadeIn>
	);

}