import * as React from 'react';
import FadeIn from "react-fade-in";
import HTTPClient from "../../utils/httpClient";
import SignUpProgressBar from "../../components/SignUpProgressBar";

export default function FirstAndLastNames ({
      setUserConfirmed, setStep
}) {

	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [error, setError] = React.useState("");

	const register = () => HTTPClient("/auth/register", "POST", {
		firstName, lastName
	}).then((res) => {
		window.localStorage.setItem("TIMESTACK_TOKEN", res.data.token);
		setStep(1);
	}).catch((_err) => setError("Make sure that you entered valid information"));

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
				register()
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

			<SignUpProgressBar percent={"25"}/>
			<img width={"170px"} style={{
				fill: "white",
				position: "absolute",
				top: "7%",
				left: "50%",
				transform: "translateX(-50%)"
			}} src={"images/logoglow.png"}/>
				<div style={{paddingTop: "280px"}}/>
				<div className="input-group mb-3">
					<div className="input-group mb-3 text-center" style={{borderRadius: "1rem", display: "flex",
						justifyContent: "center"}}>

						<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>What&apos;s your name ?</h2>
						<br/><br/><br/>
						<input
							required={true}
							className={"sign-up-phone-number"}
							type="text"
							style={{
								padding: 0, margin: 0

							}}
							name={"firstName"}
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							placeholder="First name"
						/>
						<br/>
						<input
							required={true}
							className={"sign-up-phone-number"}
							type="text"
							style={{
								padding: 0, margin: 0

							}}
							name={"lastName"}
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							placeholder="Last name"
						/>

					</div>
				</div>
				<br/>

				<button
					type={"submit"}
					style={{
						background: "transparent",
						border: "none !important",
						fontSize :0,
						width: "0%",
						height: "0%"
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
	);
}