import IOS from "../../components/ios";
import Link from "next/link";
import React from "react";
import HTTPClient from "../../utils/httpClient";
import ProfilePicture from "../../components/ProfilePicture";
import FadeIn from "react-fade-in";
import Router from "next/router";

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
								style={{width: "100%", borderRadius: "10px"}}
							>
								Save
							</button>
							<hr/>
							<h5>Delete account</h5>
							<h6>{user?.queuedForDeletionAt ?
								"You can abort the deletion of your account until " + new Date(user.queuedForDeletionAt).toLocaleString() :
								"Use the button below to initialize deletion. Your account will stay active for 7 days before it is permenantly deleted. You can abort that process until the buffer period ends."}
							</h6>
							<button onClick={() => {
								HTTPClient(user.queuedForDeletionAt ? "/auth/account/delete/abort" : "/auth/account/delete", "POST")
									.then(res => setUser({
										...user,
										queuedForDeletionAt: res.data.queuedForDeletionAt
								}))
								.catch((err) => alert("An error occurred"));
							}} className={"btn btn-outline-danger"} style={{width: "50%", borderRadius: "10px"}}>
								{user?.queuedForDeletionAt ? "Abort deletion" : "Schedule deletion"}
							</button>
						</div>
					</div>
				</div>

			</FadeIn>
		</IOS>
	);
}