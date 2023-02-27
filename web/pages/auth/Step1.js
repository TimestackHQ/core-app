import * as React from "react";

const openLink = link => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openLink",
	link
}));

export default function Step1 ({setStep}) {
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

			<img alt={""} className={"white-shadow"} width={"230px"} style={{
				fill: "white",
				position: "absolute",
				top: "40%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/We take privacy seriously..png"}/>

			<img alt={""} onClick={() => openLink("https://bit.ly/timestack-privacy")} className={"white-shadow"} width={"44%"} style={{
				fill: "white",
				position: "absolute",
				bottom: "23%",
				left: "28%",
				transform: "translateX(-50%)",
				zIndex: 999
			}} src={"images/privacy.png"}/>
			<img alt={""} onClick={() => openLink("https://bit.ly/timestack-terms")} className={"white-shadow"} width={"44%"} style={{
				fill: "white",
				position: "absolute",
				bottom: "23%",
				left: "74%",
				transform: "translateX(-50%)",
				zIndex: 999
			}} src={"images/terms.png"}/>

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
			}}>By clicking “CONTINUE”, you agree to our<br/> Privacy Policy and Terms of Service.</p>

			<img alt={""} onClick={() => setStep(1)} className={"white-shadow"} width={"100%"} style={{
				fill: "white",
				position: "absolute",
				bottom: "5%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 999
			}} src={"images/continue.png"}/>




		</div>
	);
}