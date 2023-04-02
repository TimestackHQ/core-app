import * as React from "react";
import {useRouter} from "next/router";
import {NativeNavigate, NativeResetStack, notifyNativeOfSession} from "../../utils/nativeBridge";

export default function Adventure ({setStep, setUserConfirmed}) {

	const router = useRouter();

	setTimeout(() => {
		notifyNativeOfSession();
		NativeResetStack();
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



			 <div>
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
			</div>



		</div>
	);
}