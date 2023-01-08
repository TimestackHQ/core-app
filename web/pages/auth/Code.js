import * as React from 'react';
import FadeIn from "react-fade-in";

export default function Code ({
	code,
	setCode,
	setStep,
	confirmCode,
	error,
    initLogin
}) {

	const [spinner, setSpinnerRaw] = React.useState(false);
	const setSpinner = () => {
		setSpinnerRaw(true);
		setTimeout(() => {
			setSpinnerRaw(false);
		}, 1000);
	}
	return (
		<form onSubmit={e => {
			e.preventDefault();
			confirmCode();
		}}>
			<FadeIn>
				<div style={{paddingTop: "200px"}}/>
				<h2 className={"h4 mb-3 fw-normal"}>We&#39;ve texted you the authentication code</h2>
				<div className="input-group mb-3">
					<input
						type="text"
						style={{textAlign: "center", borderRadius: "1rem"}}
						className="form-control-lg form-control"
						placeholder="Code"
						aria-label="Code"
						aria-describedby="basic-addon2"
						value={code}
						id="single-factor-code-text-field"
						autoComplete="one-time-code"
						onChange={(e) => setCode(e.target.value)}
					/>
				</div>
				<p style={{fontSize: "12px", color: "gray"}}>
					Didn&#39;t get it? <b><a href={"#"} onClick={() => {
						initLogin(false);
						setCode("");
						setSpinner();
					}
				}>Resend</a></b> {spinner ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
				</p>
				<br/>
				<button
					className={"w-100 btn btn-lg btn-primary"}
					type={"submit"}
					disabled={code?.length !== 6}
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