import React, { useState } from "react";
import { Image, View } from "react-native";
import FastImage from "react-native-fast-image";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import HTTPClient from "../httpClient";
import { useNavigation } from "@react-navigation/native";
import { SocialProfileScreenNavigationProp } from "../navigation";

export default function ProfilePicture({ userId, location, width, height, style, pressToProfile = false }: {
	userId?: string,
	location?: string,
	width?: number,
	height?: number,
	style?: any,
	pressToProfile?: boolean
}) {


	const navigator = useNavigation<SocialProfileScreenNavigationProp>();

	return <TouchableWithoutFeedback onPress={() => {
		if (userId) HTTPClient("/social-profiles/hasAccess").then(res => {
			navigator.navigate("SocialProfile", {
				userId: userId
			});
		}).catch(err => {
		});
	}}>
		<View>
			{String(location).startsWith("https://") ? <FastImage
				style={{ borderRadius: 1000, objectFit: "cover", width: width ? width : 90, height: height ? height : 90, ...style }}
				source={{ uri: location }}
			/> : <Image
				style={{ borderRadius: 1000, objectFit: "cover", width: width ? width : 90, height: height ? height : 90, ...style }}
				// @ts-ignore
				source={location}
			/>}
		</View>
	</TouchableWithoutFeedback>;
}