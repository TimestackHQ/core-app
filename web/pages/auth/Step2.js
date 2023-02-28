import * as React from "react";

const openLink = link => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openLink",
	link
}));

export default function Step2 ({setStep}) {
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

			<img width={"170px"} style={{
				fill: "white",
				position: "absolute",
				top: "7%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/logoglow.png"}/>

			<img alt={""} className={"white-shadow"} width={"200px"} style={{
				fill: "white",
				position: "absolute",
				top: "40%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"icons/Click on your invite link..png"}/>


			<p style={{
				position: "absolute",
				bottom: "14%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 999,
				color: "white",
				fontWeight: "500",
				width: "80%",
				fontSize: "14px"
			}}>You can only join Timestack Beta through an <br/>invite link by an existing user as of now.</p>

			<img alt={""} onClick={() => setStep(1)} className={"white-shadow"} width={"90%"} style={{
				fill: "white",
				position: "absolute",
				bottom: "5%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 999
			}} src={"images/no invite.png"}/>




		</div>
	);
}