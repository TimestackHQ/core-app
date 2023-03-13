import ProfilePicture from "../ProfilePicture";
import moment from "moment";
import React from "react";
import Router from "next/router";
import {NativeNavigate} from "../../utils/nativeBridge";

export default function EventInviteNotification ({notification, timeAgo}) {
	const payload = notification.data.payload;
	return (
		<div onClick={() => {
			NativeNavigate("Event",{
				eventId: payload.eventId._id
			})
			// router.push("/event/"+event?.publicId+"?name="+event?.name+"&location="+event?.location)
		}} className={"row"} style={{paddingBottom: "3px", paddingTop: "10px", overflowX: "hidden"}}>
			<div className={"col-2"}>
				<ProfilePicture width={"45px"} height={"45px"} location={notification?.userProfilePicture}/>
			</div>
			<div className={"col-8"} style={{marginLeft: "-10px", marginTop: "5px"}}>
				<h6 style={{fontSize: "14px", width: "90%"}}>
					<b>{payload?.userName}</b> invites you to <b>{payload.eventName}</b>
				</h6>
			</div>
			<div className={"col-1"} style={{marginLeft: "-35px", height: "100%", color: "gray", marginTop: "12px", display: "flex", justifyContent: "flex-end"}}>
				<b style={{fontSize: "12px", display: "flex", justifyContent: "flex-end"}}>{timeAgo}</b>
			</div>
			<div className={"col-1"} style={{marginLeft: "-20px"}}>
				<div style={{backgroundColor: notification?.acknowledgedAt ? "white" : "#E41E1E", width: "5px", height: "5px", borderRadius: "10px", marginLeft: "62px", marginTop: "20px"}}/>
				<img src={notification.eventCover} style={{width: "40px", height: "55px", borderRadius: "4px", marginTop: "-35px", marginLeft: "15px"}}/>

			</div>

		</div>
	);

}