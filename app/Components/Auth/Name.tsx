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

        <TextInput
            placeholder={"First Name"}
            placeholderTextColor={"#b0b0b0"}
            value={firstName}
            style={{
                width: "80%",
                height: 50,
                borderRadius: 20,
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: "Red Hat Display Bold",
                marginTop: 20,
                fontSize: 35,
            }}
            onChangeText={(text) => {
                setFirstName(text);
            }}

        />

        <TextInput
            placeholder={"Last Name"}
            placeholderTextColor={"#b0b0b0"}
            value={lastName}
            style={{
                width: "80%",
                height: 50,
                borderRadius: 20,
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: "Red Hat Display Bold",
                marginTop: 20,
                fontSize: 35,
            }}
            onChangeText={(text) => {
                setLastName(text);
            }}

        />


    </View>
}