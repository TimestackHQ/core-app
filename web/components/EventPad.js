import React, {useEffect} from "react";
import HTTPClient from "../utils/httpClient";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import Router from "next/router";
import {NativeNavigate} from "../utils/nativeBridge";

export default function EventPad ({event}) {



	const [uri, setUri] = React.useState("");
	const [placeholder, setPlaceholder] = React.useState("");
	useEffect(() => {
		HTTPClient("/media/"+event.cover+"?snapshot=true").then(res => setPlaceholder(res.data))
			.catch(err => {});
		HTTPClient("/media/"+event.cover+"?thumbnail=true").then(res => setUri(res.data))
			.catch(err => {});
	}, []);

	return (
		<div onClick={() => NativeNavigate("Invite",{
			eventId: event._id
		})} className={"text-center"} style={{
			backgroundImage: `url("${uri}")`,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			height: "200px",
			width: "140px",
			zIndex: 1,
			borderRadius: "10px",
			overflow: "hidden",
			marginLeft: "10px",
			marginRight: "0px",
			display: "inline-block",
			overflowY: "scroll",
			backgroundColor: "#efefef",

		}}>

			<h2 style={{
				textShadow: "0px 0px 5px rgba(0, 0, 0, 1)",
				fontFamily: '"athelas", serif',
				fontWeight: 1000,
				fontStyle: "normal",
				fontSize: "1.2rem",
				color: "white",
				paddingTop: "3vh",
				marginBottom: "0px",
				lineHeight: "1",
			}}>{event?.name}</h2>

		</div>
			// <LazyLoadImage src={uri}
            //    // style={{objectFit: "cover", margin: 0, padding: 0}}
            //    alt="Image Alt"
			// 	width={"100px"}
			//                height={"100px"}
			// />


	);
}