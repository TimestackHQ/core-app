import React, {useState} from "react";
import FadeIn from "react-fade-in";
import { useRouter } from 'next/router'
import HTTPClient from "../utils/httpClient";
import IOS from "../components/ios";
import CoverPicture from "../components/CoverPicture";
import {NativeNavigate} from "../utils/nativeBridge";

const buttonStyle = {
	borderRadius: "0px",
	borderTop: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",

}


export default function Home() {

	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const [startsAt, setStartsAt] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [cover, setCover] = useState(null);

	const [invitees, setInvitees] = useState([]);


	const router = useRouter();

	const locationRef = React.useRef(null);

	React.useEffect(() => {
		const autocomplete = new window.google.maps.places.Autocomplete(locationRef.current, {
			componentRestrictions: { country: ["us", "ca"] }
		});

		autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();
			console.log(place);
		});

		locationRef.current.placeholder = "";
	}, []);



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
									setName("");
									setLocation("");
									setStartsAt("");
									setEndsAt("");
									setInvitees([]);
									setCover(null);
									NativeNavigate("HomeStack", {
										screen: "Event",
										params: {
											eventId: res.data.event._id,
												eventName: res.data.event.name,
										}
									})
								}).catch((err) => {
									alert(err);
								})
							}} className={"row"} style={{margin: "0px"}}>
								<h1>
									<b>Create</b>
								</h1>

								<div className={"row"}>
									<div className={"col-12"}>
										<input style={buttonStyle} className={"form-control crud_input"} value={name} onChange={(e) => setName(e.target.value)} required/>
										<h6 style={{color: "gray"}}>Name</h6>
									</div>

									<div className={"col-12"}>
										<input ref={locationRef} style={buttonStyle} className={"form-control crud_input"} value={location} onChange={(e) => setLocation(e.target.value)} required/>
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
										<CoverPicture setCover={setCover}/>

									</div>
									<div className={"col-12"}>
										<button style={{width: "100%"}} type={"submit"} className={"btn btn-outline-secondary btn-block"}>Create</button>

										<br/>
										<br/>
										<br/>
									</div>



								{/*<br/>*/}
								{/*<br/>*/}
								{/*<br/>*/}
								{/*<br/>*/}
								{/*<br/>*/}

								{/*<br/>*/}
								{/*<br/>*/}
								{/*<br/>*/}

								<br/>
								<br/>
								<br/>
								</div>
							</form>
						</div>
						</FadeIn>
					</div>

				</div>

		</div>
		</div>
	</IOS>

}
