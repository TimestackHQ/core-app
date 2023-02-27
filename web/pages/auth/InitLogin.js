import React from "react";
import FadeIn from "react-fade-in";
import {icons} from "../../components/ios";

export default function InitLogin({
    phoneNumber,
	setPhoneNumber,
    setStep,
    initLogin,
	error

}) {
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
				<div style={{marginTop: "330px"}}/>

				<br/>
				{/*<div className="input-group mb-3" style={{borderRadius: "1rem"}}>*/}
				{/*	<button className="btn btn-secondary dropdown-toggle" type="button"*/}
				{/*	        data-bs-toggle="dropdown" aria-expanded="false">*/}
				{/*		+1 <img src={"/images/flags/ca.png"} alt={"Canada"} width={"25"} height={"25"} />*/}
				{/*	</button>*/}
				{/*	<ul className="dropdown-menu">*/}
				{/*		<li><a className="dropdown-item" href="#">+1 <img src={"/images/flags/us.png"} alt={"US"} width={"25"} height={"25"} /> United States</a> </li>*/}
				{/*	</ul>*/}
				{/*</div>*/}
					<div className="input-group mb-3 text-center" style={{borderRadius: "1rem", display: "flex",
						justifyContent: "center"}}>

						<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>Let&apos;s get secure right away</h2>

						<input
							min="1" max="9999999999"
							required={true}
							className={"sign-up-phone-number"}
							type="tel"
							style={{
								padding: 0, margin: 0

							}}
							name={"phoneNumber"}
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder="Your number"
						/>

					</div>

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
				}}>This is how we keep your account safe</p>

				<button
					type={"submit"}
					disabled={phoneNumber?.length !== 10}
					style={{
						background: "transparent",
						border: "none !important",
						fontSize :0,
						width: "0%",
						height: "0%"
					}}
				>
					<img alt={""} onClick={() => initLogin} className={"white-shadow"} width={"100%"} style={{
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