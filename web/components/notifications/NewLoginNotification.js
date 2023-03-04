import ProfilePicture from "../ProfilePicture";
import React from "react";
import {useSelector} from "react-redux";

export default function NewLoginNotification ({notification, timeAgo}) {
	const user = useSelector(state => state.user);
	return <div className={"row"} style={{paddingBottom: "3px", paddingTop: "10px"}}>
		<div className={"col-2"}>
			<ProfilePicture width={"45px"} height={"45px"} location={user?.profilePictureSource}/>
		</div>
		<div className={"col-8"} style={{marginLeft: "-10px", marginTop: "5px"}}>
			<h6 style={{fontSize: "14px", width: "90%"}}>{notification.body}</h6>
		</div>
		<div className={"col-1"} style={{marginLeft: "-35px", height: "100%", color: "gray", marginTop: "12px", display: "flex", justifyContent: "flex-end"}}>
			<b style={{fontSize: "12px", display: "flex", justifyContent: "flex-end"}}>{timeAgo}</b>
		</div>
		<div className={"col-1"} style={{marginLeft: "-20px"}}>
			<div style={{backgroundColor: notification?.acknowledgedAt ? "white" : "#E41E1E", width: "5px", height: "5px", borderRadius: "10px", marginLeft: "62px", marginTop: "20px"}}/>
			<img src={"images/logo-blacktimestack.svg"} style={{width: "35px", height: "55px", borderRadius: "4px", marginTop: "-35px", marginLeft: "15px"}}/>

		</div>

	</div>
}