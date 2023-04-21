import * as React from 'react';
import FadeIn from "react-fade-in";
import HTTPClient from "../../utils/httpClient";
import moment from "moment/moment";
import SignUpProgressBar from "../../components/SignUpProgressBar";

export default function Birthdate ({
      setUserConfirmed, setStep
}) {

	const [birthDate, setBirthdate] = React.useState(moment().format("YYYY-MM-DD"));

	const register = () => HTTPClient("/auth/register", "POST", {
		birthDate
	}).then((res) => {
		window.localStorage.setItem("TIMESTACK_TOKEN", res.data.token);
		setStep(1);
	}).catch((_err) => alert("You should be old enough to use Timestack."));

	return (
		<form
			style={{
				backgroundImage: `url("images/timestack city sunset 1.jpg")`,
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

			<SignUpProgressBar percent={"60"}/>

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

						<h2 style={{color: "white", fontWeight: 500, letterSpacing: -1.5, fontSize: "20px", padding: 0, margin: 0}}>When’s your birthday?</h2>
						<br/><br/><br/>
						<input
							required={true}
							className={"sign-up-phone-number"}
							type={"date"}
							style={{
								padding: 0, margin: 0,
								wordBreak: "break-all",
								width: "80%"
							}}
							value={birthDate}
							name={"birthDate"}
							onFocus={(e) => e.target.type = "date"}
							onChange={(e) => setBirthdate(e.target.value)}
						/>

					</div>
				</div>
				<br/>

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
			}}>You should be old enough to use Timestack.</p>

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