import React, {useEffect} from "react";
import FadeIn from "react-fade-in";
import {icons} from "../../components/ios";
import * as PhoneNumberLib from 'libphonenumber-js'

export default function InitLogin({
    phoneNumber,
	setPhoneNumber,
    setStep,
    initLogin,
	error

}) {

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
				const formattedPhoneNumber = PhoneNumberLib.parsePhoneNumber(phoneNumber, 'CA');
				if (formattedPhoneNumber.isValid()) {
					setPhoneNumber(formattedPhoneNumber.formatInternational());
					initLogin(formattedPhoneNumber.formatInternational())
				} else {
					alert("Please enter a valid phone number.")
				}
			}
		}>
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
				<div style={{marginTop: "50%"}}/>

				<br/>

				<div className="input-group mb-3 text-center" style={{
					borderRadius: "1rem",
					display: "flex",
					justifyContent: "center"
				}}>

					<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>Let&apos;s get secure right away</h2>

					<input
						ref={inputRef}
						required={true}
						className={"sign-up-phone-number"}
						autoFocus={true}
						type="text"
						style={{
							padding: 0, margin: 0

						}}
						autoComplete={"tel"}
						name={"phoneNumber"}
						value={phoneNumber}
						onChange={(e) => {
							setPhoneNumber(new PhoneNumberLib.AsYouType().input(e.target.value))
						}}
						placeholder="Your number"
					/>

				</div>

				<p style={{
					position: "absolute",
					top: "86%",
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: -1,
					color: "white",
					fontWeight: "500",
					width: "80%",
					fontSize: "14px",
				}}>This is how we keep your account safe.</p>

				<button
					className={"btn btn-dark"}
					type={"submit"}
					style={{
						position: "absolute",
						top: "90%",
						left: "5%",
						width: "90%",
						backgroundColor: "white",
						fontSize: "22px",
						height: "50px",
						borderRadius: "2rem",
						borderWidth: "0px",
						fontWeight: "500",
						textShadow: "0 0 15px #FFF",
						zIndex: 1000,
						color: "black"
					}}
				>
					CONTINUE
				</button>


		</form>


	)
}