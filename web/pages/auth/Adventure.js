import * as React from "react";
import {useRouter} from "next/router";

export default function Adventure ({setStep, setUserConfirmed}) {

	const router = useRouter();

	setTimeout(() => {
		if(router.query.eventId) window.location.href = "/event/"+router.query.eventId+"/join";
	}, 1500);

	return (
		<div className={"text-center"} style={{
			backgroundImage: `url("images/timestack city sunset 1.png")`,
			backgroundSize: "cover",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			height: "100%",
			width: "100vw",
			position: "absolute",
			top: "0",
			left: "0",
			zIndex: 1,
			margin: 0,
			overflow: "hidden"
		}}>


			<img className={"white-shadow"} width={"240px"} style={{
				fill: "white",
				position: "absolute",
				top: "20%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/logo-glow.png"}/>



			{!router.query.eventId ? <img className={"white-shadow"} width={"200px"} style={{
				fill: "white",
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"icons/You’re on the waitlist!.png"}/> : <div>
				<img className={"white-shadow"} width={"50px"} style={{
					fill: "white",
					position: "absolute",
					top: "48%",
					left: "50%",
					transform: "translateX(-50%)"
				}} src={"images/Ellipse 5.png"}/>

				<img className={"white-shadow"} width={"220px"} style={{
					fill: "white",
					position: "absolute",
					top: "55%",
					left: "50%",
					transform: "translateX(-50%)"
				}} src={"images/Adventure awaits..png"}/>
			</div>}


				{!router.query.eventId ? <p style={{
				position: "absolute",
				bottom: "10%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 999,
				color: "white",
				fontWeight: "500",
				width: "80%",
				fontSize: "20px"
			}}>We’ll alert you via SMS and email.</p> : null}

			{!router.query.eventId ? <button
				type={"submit"}
				style={{
					background: "transparent",
					borderWidth: 0,
					fontSize :0,
					width: "0px",
					height: "0px",
				}}
			>
				<img alt={""} className={"white-shadow"} width={"100%"} style={{
					fill: "white",
					position: "absolute",
					bottom: "4%",
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: 999
				}} src={"icons/not.png"}/>
			</button> : null}

		</div>
	);
}