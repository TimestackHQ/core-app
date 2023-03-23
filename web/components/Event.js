import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import HTTPClient, {restOrigin} from "../utils/httpClient";
import { ShimmerThumbnail } from "react-shimmer-effects";
import {LazyLoadImage} from "react-lazy-load-image-component";
import Image from "next/image";
import {NativeNavigate} from "../utils/nativeBridge";

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
				eventLocation: event.location
			})
			// router.push("/event/"+event?.publicId+"?name="+event?.name+"&location="+event?.location)
		}} className={"card "} style={{
			backgroundColor: "white",
			boxShadow: "rgba(100, 100, 111, 0.1) 0px 3px 29px 0px",
			borderRadius: "15px",
			marginBottom: "15px"
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
				<div className={"col-5"} style={{paddingLeft: "0px"}}>
					<h6 style={{marginTop: "10px", marginBottom: "0px"}}><b>{event?.name}</b></h6>
					<p style={{fontSize: "10px", marginBottom: "0px", marginLeft: "1px"}}>{event?.location}</p>
					<p style={{fontSize: "10px", marginLeft: "1px"}}>June 17 - 21, 2022
					</p>
					<div style={{position : "absolute",
						bottom   : 15}}>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/MingXi Profile.jpg"}/>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Flavia Profile.jpg"}/>
						<img width="100px" style={{width: "20px", borderRadius: "25px", marginRight: "5px"}} src={"/events/pics/Dostie Profile.jpg"}/>

					</div>

				</div>
				<div className={"col-3"}>

					<p style={{fontSize: "10px", marginTop: "15px", marginLeft: "10px"}}>
						<img className={"red-apple"} src={"/icons/favorite_FILL0_wght400_GRAD0_opsz48.svg"} alt={"heart"} width={"12px"} style={{marginTop: "0px"}}/> 5<br/>
						<img className={"red-apple"} src={"/icons/image_FILL0_wght300_GRAD0_opsz48.svg"} alt={"heart"} width={"12px"} style={{marginTop: "0px"}}/> 404

					</p>
				</div>

			</div>

		</div>
	);

}