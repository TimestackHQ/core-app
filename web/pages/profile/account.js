import IOS from "../../components/ios";
import Link from "next/link";
import React from "react";
import HTTPClient from "../../utils/httpClient";
import ProfilePicture from "../../components/ProfilePicture";
import FadeIn from "react-fade-in";
import Router from "next/router";
import moment from "moment";

const buttonStyle = {
	borderRadius: "0px",
	borderTop: "0px",
	borderRightWidth: "0px",
	borderLeftWidth: "0px",
};


export default function Index() {

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

	const save = () => {
		HTTPClient("/profile", "POST", {
			email: user.email,
			phoneNumber: user.phoneNumber,
		})
			.then((_req) => Router.push("/profile"))
			.catch((err) => alert(err.response.data.message ? err.response.data.message : "An error occurred"));
	}

	return (
		<IOS
			buttons={[
				{
					icon: "leftArrow",
					href: "/profile",
					position: "left"
				},
			]}
		>
			<FadeIn>
				<div className={"container"} style={{paddingTop: 0, marginTop: 0} }>
					<div className={"row"} style={{paddingTop: 0, marginTop: 0} }>
						<div className={"col-12"}>
							<h3>Account</h3>
							<br/>
							<div className={"row"}>
								<div className={"col-4"} style={{paddingTop: "8px", marginRight: 0, paddingRight: 0}}>
									Phone Number
								</div>
								<div className={"col-8"}>
									<input style={buttonStyle} className={"form-control crud_input"} value={user?.phoneNumber} onChange={(e) => setUser({...user, lastName: e.target.value})} required/>

								</div>
							</div>
							<br/>
							<div className={"row"}>
								<div className={"col-4"} style={{paddingTop: "8px", marginRight: 0, paddingRight: 0}}>
									Email
								</div>
								<div className={"col-8"}>
									<input style={buttonStyle} className={"form-control crud_input"} value={user?.email} onChange={(e) => setUser({...user, email: e.target.value})} required/>

								</div>
							</div>
							<br/>
							<button
								className={"btn btn-primary"}
								onClick={save}
								style={{
									width: "100%",
									backgroundColor: "black",
									fontSize: "25px",
									height: "50px",
									borderRadius: "2rem",
									fontWeight: "500",
									textShadow: "0 0 15px #FFF"

								}}
							>
								Save
							</button>
							<hr/>
							<h5>Delete account</h5>
							<h6>{user?.queuedForDeletionAt ?
								"You can restore your account until " + moment(user?.queuedForDeletionAt).add(3, "days").format("MMMM Do YYYY, h:mm a") :
								<p>
									This action is permanent and cannot be undone. Make sure you have saved any important data before proceeding. <br/><br/>
									You have 3 days to change your mind before all your personal data is automatically deleted. Other users can’t discover you on Timestack during this time.
								</p>}
							</h6>
							<button onClick={() => {
								HTTPClient(user.queuedForDeletionAt ? "/auth/account/delete/abort" : "/auth/account/delete", "POST")
									.then(res => setUser({
										...user,
										queuedForDeletionAt: res.data.queuedForDeletionAt
								}))
								.catch((err) => alert("An error occurred"));
							}} className={"btn btn-light"}

						        style={{
									width: "100%",
							        backgroundColor: user?.queuedForDeletionAt ? "#2e8eff": "#da2626",
							        borderColor: "transparent",
							        color: "white",
							        fontSize: "25px",
							        height: "50px",
							        borderRadius: "2rem",
							        fontWeight: "500",
							        marginTop: "10px",
							        textShadow: user?.queuedForDeletionAt ? "0 0 15px #FFF" : undefined


						        }}

							>
								{user?.queuedForDeletionAt ? "Restore account" : "Delete"}
							</button>
						</div>
					</div>
				</div>

			</FadeIn>
		</IOS>
	);
}