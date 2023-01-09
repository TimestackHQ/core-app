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
	const [step, setStepRaw] = React.useState(1);
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
			dispatch({type: "SET_USER", payload: userInitRoutine()});
			setStep(1);
			if(res.data.message === "User confirmed") {
				setUserConfirmed(true);
			}
		})
		.catch((_err) => setError("The code you entered is invalid"));
	}

	return (
		<div className={"container"}>
			<div className={"content"}>
				{step !== 1 ? <FadeIn>
					<button style={{marginTop: "10px"}} className={"btn btn-outline-secondary btn-sm"} onClick={() => setStep(-1)}>
						<i className={"fas fa-arrow-left"}/> Back
					</button>
				</FadeIn> : null}
				<div className="row justify-content-center align-items-center ">
					<div className="col-lg-5 col-sm-10 text-center ">

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