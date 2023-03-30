import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import HTTPClient, {restOrigin} from "../utils/httpClient";
import { ShimmerThumbnail } from "react-shimmer-effects";
import {LazyLoadImage} from "react-lazy-load-image-component";
import Image from "next/image";
import {NativeNavigate} from "../utils/nativeBridge";
import ProfilePicture from "./ProfilePicture";
import {dateFormatter} from "../utils/time";

export default function EventCard ({
   event
}) {

	const router = useRouter();

	const [placeholder, setPlaceholder] = useState("");
	const [uri, setUri] = useState("");

	useEffect(() => {
		HTTPClient("/media/"+event.cover+"?snapshot=true").then(res => setPlaceholder(res.data))
			.catch(err => {});
		HTTPClient("/media/"+event.cover+"?thumbnail=true").then(res => setUri(res.data))
			.catch(err => {});
	}, [])

	return (
		<div onClick={() => {
			NativeNavigate("Event", {
				eventId: event.publicId,
				eventName: event.name,
				eventLocation: event.location,
				eventPlaceholder: event?.buffer
			})
			// router.push("/event/"+event?.publicId+"?name="+event?.name+"&location="+event?.location)
		}} className={"card "} style={{
			backgroundColor: "#fcfbfb",
			borderRadius: "15px",
			marginBottom: "10px",
			height: "145px"
		}}>
			<div className={"row"}>
				<div className={"col-4"}>
					<div style={{
						backgroundImage: event?.buffer ? `url(data:image/jpeg;base64,${event?.buffer})` : `url(${placeholder})`,
						backgroundSize: "cover",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "center",
						borderRadius: "15px 15px 15px 15px",
						height: "145px",
						borderWidth: event?.buffer ? "0px" : "1px",
						borderStyle: "solid",
						borderColor: "black"
					}}>
						<img

							src={uri}
							effect="blur"
							loading={"lazy"}
							style={{
								borderRadius: "15px",
								objectFit: "cover",

								// "backgroundSize":"contain","backgroundRepeat":"no-repeat"
							}}
							alt={""}
							width={"100%"} height={"145px"}
						/>
					</div>

				</div>
				<div className={"col-6"} style={{paddingLeft: "0px"}}>
					<h6 style={{marginTop: "10px", marginBottom: "0px", overflowX: "scroll",height: "65px"
					}}><b>{event?.name}</b></h6>
					<p style={{fontSize: "12px", marginBottom: "0px", marginLeft: "1px"}}>{event?.location}</p>
					<p style={{fontSize: "13px", marginLeft: "1px", position: "absolute", bottom: "17px"}}>{dateFormatter(new Date(event?.startsAt), event?.endsAt ? new Date(event?.endsAt) : null)}</p>
					<div style={{position : "absolute",
						backgroundColor: "#fcfbfb",
						width: "100%",
						display: "flex",
						flexWrap: "wrap",
						bottom   : 3}}>

						{/*{event.people.map((user, i) => {*/}
						{/*	return <ProfilePicture style={{marginRight: "5px"}} key={i} width="25px" height={"25px"} location={user.profilePictureSource}/>*/}
						{/*})}*/}

						{event.people.map((user, i) => {
							return i === 5 && event?.peopleCount > 6 ? <div key={i} style={{}}>
								<div style={{
									backgroundColor: "black",
									width: "25px",
									height: "25px",
									borderRadius: "30px",

								}}>
									<span style={{
										zIndex: 1,
										position: "absolute",
										marginLeft: event.peopleCount-6 < 10 ? "8px" : "8px",
										marginTop: "4px",
										height: "25px", width: "25px",
										borderRadius: "30px",
									}}>
										<p style={{color: "#ffffff", fontSize: 12}}>{event.peopleCount-6}</p>
									</span>
									<ProfilePicture style={{marginRight: "5px", opacity: 0.6, marginBottom: 2}} key={i} width="25px" height={"25px"} location={user.profilePictureSource}/>
								</div>
							</div> : <ProfilePicture  style={{marginRight: "5px",marginBottom: 2}} key={i} width="25px" height={"25px"} location={user.profilePictureSource}/>

						})}

					</div>

				</div>
				<div className={"col-2"} style={{marginLeft: "0px"}}>

					<p style={{fontSize: "12px", marginTop: "10px"}}>
						<img className={"red-apple"} src={"/icons/image_FILL0_wght300_GRAD0_opsz48.svg"} alt={"heart"} width={"14px"} style={{marginTop: "0px", marginBottom: "2px"}}/> {event?.mediaCount}
					</p>
				</div>

			</div>

		</div>
	);

}