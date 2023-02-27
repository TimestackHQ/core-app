import * as React from "react";

export default function SignUpProgressBar ({percent}) {
	return <div className="progress" style={{
		display: "flex",
		justifyContent: "start",
		position: "absolute",
		width: "165px",
		height: "2px",
		backgroundColor: "rgba(255, 255, 255, 0.5)",
		top: "12.5%", left: "50%", 				transform: "translateX(-50%)"
	}}>
		<div
			className="progress-bar"
			role="progressbar"
			style={{ width: percent+'%', backgroundColor: "white" }}

			aria-valuenow="25"
			aria-valuemin="0"
			aria-valuemax="100"
		></div>
	</div>
}