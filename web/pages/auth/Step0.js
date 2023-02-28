import * as React from "react";
import {useEffect} from "react";
import {useRouter} from "next/router";

export default function Step0 ({setStep}) {

	const router = useRouter();

	useEffect(() => {
		window.localStorage.removeItem("TIMESTACK_TOKEN");
	}, [])

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

			<img className={"white-shadow"} width={"180px"} style={{
				fill: "white",
				position: "absolute",
				top: "48%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/Make great memories..png"}/>

			<img onClick={() => setStep(1)} className={"white-shadow"} width={"100%"} style={{
				fill: "white",
				position: "absolute",
				bottom: "5%",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 999
			}} src={"images/button-glow.png"}/>




		</div>
	);
}