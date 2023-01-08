import React from "react";
import FadeIn from "react-fade-in";

export default function InitLogin({
    phoneNumber,
	setPhoneNumber,
    setStep,
    initLogin,
	error

}) {
	return (

		<form onSubmit={e => {
			e.preventDefault();
			initLogin()
		}}>
			<FadeIn>
				<img style={{marginTop: "150px"}} className={"mb-4"} src={"/images/logo@timestack.svg"} alt={"Logo"} width={"72"} height={"72"} />
				<br/>
				<h2 className={"h4 mb-3 fw-normal"}>Welcome 👋<br/>Enter your phone number</h2>
				<br/>
				<div className="input-group mb-3" style={{borderRadius: "1rem"}}>
					<button className="btn btn-outline-secondary dropdown-toggle" type="button"
					        data-bs-toggle="dropdown" aria-expanded="false">
						+1 <img src={"/images/flags/ca.png"} alt={"Canada"} width={"25"} height={"25"} />
					</button>
					<ul className="dropdown-menu">
						<li><a className="dropdown-item" href="#">+1 <img src={"/images/flags/us.png"} alt={"US"} width={"25"} height={"25"} /> United States</a> </li>
						{/*<li><a className="dropdown-item" href="#">Another action</a></li>*/}
						{/*<li><a className="dropdown-item" href="#">Something else here</a></li>*/}
						{/*<li>*/}
						{/*  <hr className="dropdown-divider"/>*/}
						{/*</li>*/}
						{/*<li><a className="dropdown-item" href="#">Separated link</a></li>*/}
					</ul>
					<input
						type={"number"}
						min="1" max="9999999999"
						required={true}
						className="form-control"
						style={{borderTopRightRadius: "1rem", borderBottomRightRadius: "1rem"}}
						aria-label="Text input with dropdown button"
						name={"phoneNumber"}
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
					/>

				</div>
				{/* eslint-disable-next-line react/no-unescaped-entities */}
				<p style={{fontSize: "12px", color: "gray"}}>By entering your phone number, you're agreeing to our <u>Terms of Use</u> and <u>Privacy Policy</u>.</p>
				<br/>
				<button
					className={"w-100 btn btn-lg btn-primary"}
					type={"submit"}
					disabled={phoneNumber?.length !== 10}
				>
					Continue <i className="fa-solid fa-arrow-right"></i>
				</button>
				{error ? <FadeIn>
					<hr/>
					<div className={"alert alert-danger"} role={"alert"}>
						{error}
					</div>
				</FadeIn> : null}
			</FadeIn>

		</form>


	)
}