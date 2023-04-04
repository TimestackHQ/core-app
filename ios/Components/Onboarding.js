import {View, Text, TouchableOpacity, SafeAreaView, Image} from "react-native";
import {useState} from "react";
import FastImage from "react-native-fast-image";
import * as React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Onboarding({setFirstLoad}) {
	const [step, setStep] = useState(0);

	return <View style={{flex: 1, backgroundColor: "white"}}>

		<SafeAreaView style={{flexDirection: "row", justifyContent: "center", alignItems: "center", flex: 8}}>
			{step === 0 ?<Image source={require("../assets/screens/screen0.png")} style={{width: "100%", height: "100%", objectFit: "contain"}}/>
				: step === 1 ? <Image source={require("../assets/screens/screen1.png")} style={{width: "100%", height: "100%", objectFit: "contain"}}/>
					: step === 2 ? <Image source={require("../assets/screens/screen2.png")} style={{width: "100%", height: "100%", objectFit: "contain"}}/>
						: step === 3 ? <Image source={require("../assets/screens/screen3.png")} style={{width: "100%", height: "100%", objectFit: "contain"}}/>
							: null}

		</SafeAreaView>
		<View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", flex: 1}}>
			<TouchableOpacity style={{
				textAlign: "center",
				color: "grey",
				position: "absolute",
				bottom: 0,
				marginTop: 10,

				marginRight: 0,
				width: "90%",
				height: 50,
				backgroundColor: "black",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 35,
				marginBottom: 20,
				paddingRight: 0,
			}}
				onPress={async () => {
					if(step < 3) {
						setStep(step + 1);
					} else {
						await AsyncStorage.setItem("@first", "false");
						setFirstLoad(false);
					}
				}}
			>
				<Text style={{
					fontFamily: "Red Hat Display Semi Bold",
					color: "white",
					fontSize: 20,
					textShadowColor: '#FFF',
					textShadowOffset: { width: 0, height: 0 },
					textShadowRadius: 10,
				}}>OKAY</Text>
			</TouchableOpacity>
		</View>

	</View>
}