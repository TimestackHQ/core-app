import * as React from 'react';
import FadeIn from "react-fade-in";
import {useEffect} from "react";

export default function Code ({
	code,
	setCode,
	setStep,
	confirmCode,
	error,
    initLogin,
	phoneNumber
}) {

	const [spinner, setSpinnerRaw] = React.useState(false);
	const [timeRemaining, setTimeRemaining] = React.useState(0);
	const setSpinner = () => {
		setSpinnerRaw(true);
		setTimeout(() => {
			setSpinnerRaw(false);
		}, 1000);
	}

	React.useEffect(() => {
		if(timeRemaining <= 0) return;
		setTimeout(() => {
			 setTimeRemaining(timeRemaining - 1);
		}, 1000);
	}, [timeRemaining]);

	const inputRef = React.useRef(null);

	useEffect(() => {
		setInterval(() => {
			inputRef?.current?.focus();
		}, 100);
	}, []);

	return (
		<form
			style={{
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
			}}
			onSubmit={e => {
				e.preventDefault();
				confirmCode();
			}}
			>
			<div
				onClick={() => setStep(-1)}
				style={{
					display: "flex",
					justifyContent: "start",
					position: "absolute",
					top: "8.5%", left: "7%"}}
			>
				<img src={"/icons/arrow_back_ios_FILL1_wght300_GRAD0_opsz48-white.png"} alt={"Back"} width={"25"} height={"25"} />

			</div>

			<img width={"170px"} style={{
				fill: "white",
				position: "absolute",
				top: "7%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/logoglow.png"}/>
			<div style={{marginTop: "180px"}}/>

			<br/>
			<div className="input-group mb-3 text-center" style={{borderRadius: "1rem", display: "flex",
				justifyContent: "center"}}>

				<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>Enter the code we sent to<br/>{phoneNumber}</h2>

				<input
					maxLength="6" minLength="6"
					required={true}
					className={"sign-up-phone-number"}
					type="text"
					pattern="\d*"
					ref={inputRef}
					style={{
						padding: 0, margin: 0

					}}
					name={"phoneNumber"}
					autoComplete="one-time-code"
					onChange={(e) => setCode(e.target.value)}
					value={code}
					placeholder="●●●●●●"
					autoFocus={true}
				/>

			</div>
				<p style={{fontSize: "14px", color: "white"}}>
					Didn&#39;t get it? <b><br/>
						{timeRemaining ? <span style={{color: "white"}}>Resend in {timeRemaining}s</span> : <a style={{color: "white"}} href={"#"} onClick={() => {
							initLogin(false);
							setTimeRemaining(30);
							setCode("");
							setSpinner();
						}
						}>Resend</a>}
					</b>
					{spinner ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
				</p>
				<br/>
				<p style={{
					position: "absolute",
					bottom: "46%",
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: 999,
					color: "white",
					fontWeight: "500",
					width: "80%",
					fontSize: "16px"
				}}>This code is only for you.</p>

				<button
					type={"submit"}
					style={{
						background: "transparent",
						borderWidth: 0,
						fontSize :0,
						width: "0px",
						height: "0px",
					}}
				>
					<img alt={""} onClick={() => initLogin} className={"white-shadow"} width={"100%"} style={{
						fill: "white",
						position: "absolute",
						bottom: "39%",
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 999
					}} src={"images/continue.png"}/>
				</button>
		</form>
	);
}