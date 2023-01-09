import * as React from 'react';
import FadeIn from "react-fade-in";
import HTTPClient from "../../utils/httpClient";

export default function FirstAndLastNames ({
      setUserConfirmed
}) {

	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [error, setError] = React.useState("");

	const register = () => HTTPClient("/auth/register", "POST", {
		firstName, lastName, email
	}).then((res) => {
		window.localStorage.setItem("TIMESTACK_TOKEN", res.data.token);
		setUserConfirmed(true);
	}).catch((_err) => setError("Make sure that you entered valid information"));

	return (
		<form onSubmit={e => {
			e.preventDefault();
			register();
		}}>
			<FadeIn>
				<div style={{paddingTop: "200px"}}/>
				<h2 className={"h4 mb-3 fw-normal"}>Last step, what is your name and email address ?</h2>
				<div className="input-group mb-3">
					<input
						name={"firstname"}
						type="text"
						style={{textAlign: "center", borderRadius: "1rem"}}
						className="form-control-lg form-control"
						placeholder="First Name"
						aria-describedby="basic-addon2"
						value={firstName}
						id="single-factor-code-text-field"
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<input
						name={"lastname"}
						type="text"
						style={{textAlign: "center", borderRadius: "1rem"}}
						className="form-control-lg form-control"
						placeholder="Last Name"
						aria-describedby="basic-addon2"
						value={lastName}
						id="single-factor-code-text-field"
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>
				<div className="input-group mb-3">
					<input
						name={"email"}
						type="email"
						style={{textAlign: "center", borderRadius: "1rem"}}
						className="form-control-lg form-control"
						placeholder="Email address"
						aria-describedby="basic-addon2"
						value={email}
						id="single-factor-code-text-field"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<br/>
				<button
					className={"w-100 btn btn-lg btn-primary"}
					type={"submit"}
					disabled={!firstName || !lastName || !email}
				>
					Confirm <i className="fa-solid fa-circle-check"></i>
				</button>
				{error ? <FadeIn>
					<hr/>
					<div className={"alert alert-danger"} role={"alert"}>
						{error}
					</div>
				</FadeIn> : null}
			</FadeIn>
		</form>
	);
}