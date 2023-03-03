import EventPad from "../EventPad";
import React from "react";
import Router from "next/router";

export default function NotificationsPageSuspense () {
	return (
		<div className="container">
			<div className="row flex-nowrap " style={{
				// position: "absolute",
				// top: "40px",
				marginTop: "-20px",
				padding: "10px",
				borderRightColor: "black",
				borderWidth: "10px",
				overflowX: "scroll",
			}}>
				{
					/// create 5 event pads
					[1,2,3,4,5].map((event, index) => {
						return <div key={index} onClick={() => Router.push(`/event/`+event.publicId+`/join`)} className={"text-center"} style={{
							backgroundSize: "cover",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
							height: "200px",
							width: "140px",
							zIndex: 1,
							borderRadius: "10px",
							overflow: "hidden",
							marginLeft: "10px",
							marginRight: "0px",
							display: "inline-block",
							overflowY: "scroll",
							backgroundColor: "#efefef",
						}}/>
					})
				}
			</div>
			<div className={"row"} style={{padding: "10px",}}>
				<div className={"col-12"} style={{
					height: "10px",
				}}>
					<h5>0 New events</h5>
					<hr style={{borderColor: "black"}}/>
				</div>
			</div>
		</div>
	);
}