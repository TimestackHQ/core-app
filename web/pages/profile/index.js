import IOS from "../../components/ios";
import Link from "next/link";
import React from "react";
import Router from "next/router";
import HTTPClient from "../../utils/httpClient";
import ProfilePicture from "../../components/ProfilePicture";
import FadeIn from "react-fade-in";
import {useDispatch, useSelector} from "react-redux";

export default function Index() {


	const userStore = useSelector(state => state.user);
	const dispatch = useDispatch();
	const [coverPicture, setCoverPicture] = React.useState(null);
	const [user, setUser] = React.useState(null);


	React.useEffect(() => {
		HTTPClient("/profile", "GET")
			.then((res) => {
				setUser(res.data);
				setCoverPicture(res.data.profilePictureSource);
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<IOS>
			<FadeIn className={"container"} style={{paddingTop: 0, marginTop: 0} }>
				<div className={"row"} style={{paddingTop: 0, marginTop: 0} }>
					<div className={"col-12 text-center"}>
						<div className="image-upload">
							<label htmlFor="file-input">
								<ProfilePicture location={userStore.profilePictureSource}/>
							</label>
							<input  id={"file-input"} accept="image/*" type="file" onChange={(e) => {
								e.preventDefault();

								console.log("okokokok");

								const image = e.target.files[0];


								const formData = new FormData();
								formData.append("file", new Blob([image], {type: image.type}));

								HTTPClient("/profile/picture", "POST", formData, {
									"Content-Type": "multipart/form-data",
								})
									.then((res) => {
										dispatch({type: "SET_USER", payload: {
											...userStore,
											profilePictureSource: res.data.profilePictureSource
										}})
									})
									.catch((err) => alert(JSON.stringify(err.response.data)));
							}}/>
						</div>
					</div>



					<div className={"col-12 text-center"}>
						<br/>
						<h5>{user?.firstName} {user?.lastName}</h5>
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
								onClick={() => Router.push("/profile/edit")}
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
							<li className="list-group-item" onClick={() => Router.push("/logout")}  style={{
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
						</div>



					</div>
				</div>
			</FadeIn>
		</IOS>
	);
}