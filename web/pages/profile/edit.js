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
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
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
							<h3>Profile</h3>
							<br/>
							<div className={"row"}>
								<div className={"col-4"} style={{paddingTop: "8px", marginRight: 0, paddingRight: 0}}>
									Username
								</div>
								<div className={"col-8"}>
									<input style={buttonStyle} className={"form-control crud_input"} value={user?.username} onChange={(e) => setUser({...user, username: e.target.value})} required/>

								</div>
							</div>
							<br/>
							<div className={"row"}>
								<div className={"col-4"} style={{paddingTop: "8px"}}>
									First Name
								</div>
								<div className={"col-8"}>
									<input style={buttonStyle} className={"form-control crud_input"} value={user?.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} required/>

								</div>
							</div>
							<br/>
							<div className={"row"}>
								<div className={"col-4"} style={{paddingTop: "8px"}}>
									Last Name
								</div>
								<div className={"col-8"}>
									<input style={buttonStyle} className={"form-control crud_input"} value={user?.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} required/>

								</div>
							</div>
							<br/>
							<button
								className={"btn btn-dark"}
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
						</div>
					</div>
				</div>

			</FadeIn>
		</IOS>
	);
}