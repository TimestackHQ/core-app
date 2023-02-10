import React, {Fragment, useEffect, useState} from "react";
import FadeIn from "react-fade-in";
import { useRouter } from 'next/router'
import HTTPClient from "../utils/httpClient";
import IOS from "../components/ios";
import CoverPicture from "../components/CoverPicture";
import AddPeopleScreen from "../components/AddPeopleScreen";

const buttonStyle = {
	borderRadius: "0px",
	borderTop: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",

}


export default function Home() {

	const [waitingForPeople, setWaitingForPeople] = useState(false);

	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [startsAt, setStartsAt] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [cover, setCover] = useState(null);

	const [invitees, setInvitees] = useState([]);

	const router = useRouter();

	const callback = (invitees) => {
		setWaitingForPeople(false);
		setInvitees(invitees);
	}

	return <IOS>
		<br/>
		<br/>
		<br/>
		<div className={"container"}>
			<div className="row">
				<div className={"card "} style={{
					boxShadow: "rgba(100, 100, 111, 0.5) 0px 10px 50px 0px",
					borderRadius: "3rem",
					borderBottomRightRadius: "0px",
					borderBottomLeftRadius: "0px",
				}}>

					<div className={"card-body"}>
						<FadeIn>
						<div className={"row"}>
							<form onSubmit={async (e) => {

								e.preventDefault();

								const formData = new FormData();
								formData.append("cover", new Blob([cover], {type: cover.type}));
								const coverUpload = await HTTPClient("/media/cover", "POST", formData, {
									"Content-Type": "multipart/form-data",
								});

								console.log(coverUpload);

								HTTPClient("/events", "POST", {
									name,
									location,
									startsAt,
									endsAt,
									invitees,
									cover: coverUpload.data.media.publicId,
								}, ).then(res => {
									router.push("/event/"+res.data.event._id);
								}).catch((err) => {
									alert(err);
								})
							}} className={"row"} style={{margin: "0px"}}>
								<h1>
									<b>Create</b>
								</h1>

								{waitingForPeople ?<div className={"col-12"}>
										<AddPeopleScreen currentInvitees={invitees} callback={callback}/>
									</div>
												:
								<div className={"row"}>
									<div className={"col-12"}>
										<input style={buttonStyle} className={"form-control crud_input"} value={name} onChange={(e) => setName(e.target.value)} required/>
										<h6 style={{color: "gray"}}>Name</h6>
									</div>

									<div className={"col-12"}>
										<input style={buttonStyle} className={"form-control crud_input"} value={location} onChange={(e) => setLocation(e.target.value)} required/>
										<h6 style={{color: "gray"}}>Location</h6>
									</div>

									<div className={"col-6"}>
										<input style={buttonStyle} className={"form-control"} type={"date"} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required/>
										<h6 style={{color: "gray"}}>Start date</h6>
									</div>
									<div className={"col-6"}>
										<input style={buttonStyle} className={"form-control"} type={"date"} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required/>
										<h6 style={{color: "gray"}}>End date</h6>
									</div>

									<div className={"col-12"}>
										<br/>
										<h6 style={{color: "gray"}}>People</h6>
										<div style={{}}>
											<img onClick={() => setWaitingForPeople(true)} width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
											{invitees.map((invitee, index) => {
												return <img key={index} width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={invitee?.profilePictureSource ? invitee?.profilePictureSource : "/icons/contact.svg"}/>
											})}

										</div>
									</div>
									<div className={"col-12"}>
										<br/>
										<CoverPicture setCover={setCover}/>

									</div>
									<div className={"col-12"}>
										<button style={{width: "100%"}} type={"submit"} className={"btn btn-outline-secondary btn-block"}>Create</button>

										<br/>
										<br/>
										<br/>
									</div>
								</div>}



								<br/>
								<br/>
								<br/>
								<br/>
								<br/>

								<br/>
								<br/>
								<br/>

								<br/>
								<br/>
								<br/>
							</form>
						</div>
						</FadeIn>
					</div>

				</div>

		</div>
		</div>
	</IOS>

}
