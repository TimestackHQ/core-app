import React from "react";

export default function ProfilePicture ({location, width, height}) {
	return <img
		style={{borderRadius: "1000px", objectFit: "cover"}}
		width={width ? width : "90px"}
		height={height ? height : "90px"}
		src={location ? location : "icons/contact.svg"}
		alt={"Profile Picture"}
	/>;
}