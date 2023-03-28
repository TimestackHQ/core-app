import React, {useEffect} from "react";
import FadeIn from "react-fade-in";
import {icons} from "../../components/ios";

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
				initLogin()
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
				<div style={{marginTop: "75%"}}/>

				<br/>

				<div className="input-group mb-3 text-center" style={{
					borderRadius: "1rem",
					display: "flex",
					justifyContent: "center"
				}}>

					<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>Let&apos;s get secure right away</h2>

					<input
						ref={inputRef}
						min="1" max="9999999999"
						required={true}
						className={"sign-up-phone-number"}
						autoFocus={true}
						type="tel"
						style={{
							padding: 0, margin: 0

						}}
						autoComplete={"tel"}
						name={"phoneNumber"}
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
						placeholder="Your number"
					/>

				</div>

				<p style={{
					position: "absolute",
					bottom: "12%",
					left: "50%",
					transform: "translateX(-50%)",
					zIndex: 999,
					color: "white",
					fontWeight: "500",
					width: "80%",
					fontSize: "14px"
				}}>This is how we keep your account safe</p>

				<button
					type={"submit"}
					disabled={phoneNumber?.length !== 10}
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
						bottom: "5%",
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 999
					}} src={"images/continue.png"}/>
				</button>


		</form>


	)
}