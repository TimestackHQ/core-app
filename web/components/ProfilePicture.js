import React from "react";

export default function ProfilePicture ({location}) {
	return location ? (
		<img  style={{borderRadius: "1000px", objectFit: "cover"}} width={"90px"} height={"90px"} src={location}/>
	) : null;
}