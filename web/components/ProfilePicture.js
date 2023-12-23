import React from "react";

export default function ProfilePicture ({location, width, height, style, dark}) {

	return <img
		style={{borderRadius: "1000px", objectFit: "cover", ...style}}
		width={width ? width : "90px"}
		height={height ? height : "90px"}
		src={location ? location : dark ? "/icons/contact-dark.svg" : "/icons/contact.svg"}
		alt={"Profile Picture"}
	/>;
}