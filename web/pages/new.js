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
	const [startsAt, setStartsAt] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [contact, setContact] = useState("");
	const [contacts, setContacts] = useState([]);

	const router = useRouter();

	const callback = () => {
		setWaitingForPeople(false);
	}

	return <IOS>
		<br/>
		<br/>
		<br/>
		<div className="row ">

				<div className={"card "} style={{
					boxShadow: "rgba(100, 100, 111, 0.5) 0px 10px 50px 0px",
					borderRadius: "3rem",
					borderBottomRightRadius: "0px",
					borderBottomLeftRadius: "0px",
				}}>

					<div className={"card-body"}>
						<FadeIn>
						<div className={"row"}>
							<div className={"col-12 row"} style={{margin: "0px"}}>
								<h1>
									<b>Create</b>
								</h1>

								{waitingForPeople ?<div className={"col-12"}>
										<AddPeopleScreen callback={callback}/>
									</div>
												:
								<div>
									<div className={"col-12"}>
										<input style={buttonStyle} className={"form-control crud_input"} value={name} onChange={(e) => setName(e.target.value)}/>
										<h6 style={{color: "gray"}}>Name</h6>
									</div>

									<div className={"col-12"}>
										<input style={buttonStyle} className={"form-control crud_input"} value={name} onChange={(e) => setName(e.target.value)}/>
										<h6 style={{color: "gray"}}>Location</h6>
									</div>

									<div className={"col-6"}>
										<input style={buttonStyle} className={"form-control"} type={"datetime-local"} value={startsAt} onChange={(e) => setStartsAt(e.target.value)}/>
										<h6 style={{color: "gray"}}>Start date</h6>
									</div>
									<div className={"col-6"}>
										<input style={buttonStyle} className={"form-control"} type={"datetime-local"} value={endsAt} onChange={(e) => setEndsAt(e.target.value)}/>
										<h6 style={{color: "gray"}}>End date</h6>
									</div>

									<div className={"col-12"}>
										<br/>
										<h6 style={{color: "gray"}}>People</h6>
										{contacts.map((contact, index) => {
											return <div key={index}>
												{contact}
												<button className={"btn btn-primary"} onClick={() => setContacts(contacts.filter((c, i) => i !== index))}>
													x
												</button>
											</div>
										})}
										<div style={{}}>
											<img onClick={() => setWaitingForPeople(true)} width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/icons/add-people-icon.svg"}/>
											<img width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/MingXi Profile.jpg"}/>
											<img width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Flavia Profile.jpg"}/>
											<img width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Dostie Profile.jpg"}/>
											<img width="100px" style={{width: "40px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Frederique Profile.jpg"}/>

										</div>
									</div>
									<div className={"col-12"}>
										<br/>
										<CoverPicture/>

									</div>
									<div className={"col-12"}>
										<button style={{width: "100%"}} className={"btn btn-outline-secondary btn-block"} onClick={() => {
											HTTPClient("/events", "POST", {
												name,
												startsAt,
												contacts
											}).then(res => {
												router.push("/event/"+res.data.event._id);
											}).catch((err) => {
												alert(err);
											})
										}}>Create</button>
									</div>
								</div>}



								<br/>
								<br/>
								<br/>
							</div>
						</div>
						</FadeIn>
					</div>

				</div>

		</div>

	</IOS>

}
