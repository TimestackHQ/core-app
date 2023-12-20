import {TextInput, View} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {useEffect, useRef, useState} from "react";
import TextComponent from "../Library/Text";
import {AuthFormAction} from "../../screens/Auth";

export default function NameStep({
    firstName,
    lastName,
    setFirstName,
    setLastName,
}: {
    firstName: string,
    lastName: string,
    setFirstName: (firstName: string) => void,
    setLastName: (lastName: string) => void,
}) {



    return <View style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "25%",
    }}>

        <TextComponent
            fontFamily={"Semi Bold"}
            fontColor={"white"}
            fontSize={18}
            numberOfLines={1}
            style={{
                marginBottom: 10,
                letterSpacing: -0.5,
            }}
        >
            First Name
        </TextComponent>
        <TextInput
            placeholder={"First Name"}
            placeholderTextColor={"#FFFFFF"}
            style={{
                width: "80%",
                height: 50,
                borderRadius: 20,
                backgroundColor: "#FFFFFF20",
                color: "#FFFFFF",
            }}
            onChangeText={(text) => {
            }}

        />

    </View>
}