import * as React from "react";
import FadeIn from "react-fade-in";
import InitLogin from "./InitLogin";
import httpClient from "../../utils/httpClient";
import Code from "./Code";
import Welcome from "./Welcome";
import {useDispatch} from "react-redux";
import {userInitRoutine} from "../../utils/auth";
import FirstAndLastNames from "./FirstAndLastNames";

export default function Login() {

	const dispatch = useDispatch();

	const [error, setErrorRaw] = React.useState("");
	const setError = (err) => {
		setErrorRaw(err);
		setTimeout(() => {
			setErrorRaw("");
		}, 5000);
	}
	const [step, setStepRaw] = React.useState(0);
	const setStep = (increment) => {
		setStepRaw(step + increment);
		setError("");
	}
	const [phoneNumber, setPhoneNumber] = React.useState("");
	const [code, setCode] = React.useState("");

	const [userConfirmed , setUserConfirmed] = React.useState(false);

	const initLogin = (nextStep = true) => {
		httpClient("/auth/login", "POST", {username: "+1"+String(phoneNumber)})
			.then((_res) => setStep(nextStep ? 1 : 0))
			.catch((_err) => setError("The phone number you entered is invalid"));
	}

	const confirmCode = () => {
		httpClient("/auth/confirm-login", "POST", {
			username: "+1"+phoneNumber,
			code: code
		})
		.then((res) => {
			window.localStorage.setItem("TIMESTACK_TOKEN", res.data.token);
			window.ReactNativeWebView?.postMessage(JSON.stringify({
				request: "session",
				session: res.data.token
			}));
			dispatch({type: "SET_USER", payload: userInitRoutine()});
			setStep(1);
			if(res.data.message === "User confirmed") {
				setUserConfirmed(true);
			}
		})
		.catch((_err) => setError("The code you entered is invalid"));
	}

	return (
		<div style={{
			backgroundImage: "hey.svg"
		}} className={"container"}>
			<div className={"content"}>
				{step !== 0 ? <FadeIn>
					<button style={{marginTop: "10px"}} className={"btn btn-outline-secondary btn-sm"} onClick={() => setStep(-1)}>
						<i className={"fas fa-arrow-left"}/> Back
					</button>
				</FadeIn> : null}
				<div className="row justify-content-center align-items-center ">
					<div className="col-lg-5 col-sm-10 text-center ">
						<br/>
						<br/>

						{step === 0 ? <div className={"text-center"} style={{
							backgroundImage: `url("images/MXG_evening_sunset_cozy_city_water_dreamy_people_pixar_New_York_17c83fe6-95dc-48c8-9d85-b767645172c1.png")`,
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
							}} src={"images/Make great memories.png"}/>

							<img onClick={() => setStep(1)} className={"white-shadow"} width={"100%"} style={{
								fill: "white",
								position: "absolute",
								bottom: "5%",
								left: "50%",
								transform: "translateX(-50%)",
								zIndex: 999
							}} src={"images/button-glow.png"}/>



						</div> : null}

						{step === 1 ? <InitLogin
							phoneNumber={phoneNumber}
							setPhoneNumber={setPhoneNumber}
							initLogin={initLogin}
							error={error}
						/> : null}
						{step === 2 ? <Code
							code={code}
							setCode={setCode}
							setStep={setStep}
							confirmCode={confirmCode}
							initLogin={initLogin}
							error={error}
						/> : null}

						{step === 3 && userConfirmed ? <div>
							<Welcome/>
						</div> : null}

						{step === 3 && !userConfirmed ? <div>
							<FirstAndLastNames
								setUserConfirmed={setUserConfirmed}
							/>
						</div> : null}

					</div>
				</div>
			</div>
		</div>
	);

}