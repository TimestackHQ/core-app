import IOS from "../components/ios";
import Link from "next/link";

export default function Profile() {
	return (
		<IOS>
			<div className={"container"}>
				<div className={"row"}>
					<div className={"col-12 text-center"}>
						<img style={{borderRadius: "100%"}} width={"90px"} height={"60px"} className={"img-fluid"} src={"/images/mingxi.jpg"}/>
					</div>

					<div className={"col-12 text-center"}>
						<br/>
						<h5>Achraf Ghellach</h5>
						<h6>@overcomputed</h6>
						{/*<hr/>*/}<br/>
						<ul className="list-group text-start" >
							<li className="list-group-item"
							    style={{
								    height: "50px",
								    display: 'flex',
								    alignItems: 'center',
								    color: "white",
								    backgroundColor: "#2E8EFF"
							    }}><b>Thoughts ?</b></li>
						</ul>
						<br/>
						<ul className="list-group text-start">
							<li
								className="list-group-item"
								style={{
									height: "50px",
									display: 'flex',
									alignItems: 'center',
								}}
							><b>Profile</b></li>
							<li className="list-group-item"
							    style={{
								    height: "50px",
								    display: 'flex',
								    alignItems: 'center'
							    }}><b>Account</b></li>
						</ul>
						<br/>
						<ul className="list-group text-start">
							<li className="list-group-item"
							    style={{
								    height: "50px",
								    display: 'flex',
								    alignItems: 'center'
							    }}><b>Terms of Use</b></li>
							<li className="list-group-item"
							    style={{
								    height: "50px",
								    display: 'flex',
								    alignItems: 'center'
							    }}><b>Privacy Policy</b></li>

							<li className="list-group-item"
							    style={{
								    height: "50px",
								    display: 'flex',
								    alignItems: 'center'
							    }}><b>About us</b></li>
						</ul>
						<br/>
						<ul className="list-group text-start">
							<li className="list-group-item"  style={{
								height: "50px",
								display: 'flex',
								alignItems: 'center',
							}}><span style={{color: "#ad1515"}}><b>Logout</b></span></li>

						</ul>
						<br/><br/>
						<div className={"col-12 text-center"} style={{color: "gray", lineHeight: "20px"}}>
							0.0.5
							<br/>
								Make great memories

							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
							<br/>
						</div>



					</div>
				</div>
			</div>
		</IOS>
	);
}