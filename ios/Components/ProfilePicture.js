import React from "react";
import FastImage from "react-native-fast-image";

export default function ProfilePicture ({location, width, height, style}) {
	return <FastImage
		style={{borderRadius: 1000, objectFit: "cover", width: width ? width : 90, height: height ? height : 90, ...style}}
		source={location ? {uri: location} : require("../assets/icons/profile.png")}
		alt={"Profile Picture"}
	/>;
}