import {View} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {useEffect, useRef, useState} from "react";
import TextComponent from "../Library/Text";
import {AuthFormAction} from "../../screens/Auth";

export default function AuthPhoneNumberStep({
    setPhoneNumber,
    submitForm
}: {
    setPhoneNumber: (phoneNumber: string) => void,
    submitForm: (action: AuthFormAction) => void,
}) {

    const [countryCodePart, setCountryCodePart] = useState<string>("1");
    const [phoneNumberPart, setPhoneNumberPart] = useState<string>("");

    useEffect(() => {
        setPhoneNumber("+"+countryCodePart + phoneNumberPart);
    }, [countryCodePart, phoneNumberPart]);


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
            Let's get secure right away.
        </TextComponent>
        <PhoneInput
            defaultCode="CA"
            layout="second"
            placeholder="Your phone"
            onChangeText={(text) => {
                setPhoneNumberPart(text);
                // detect if enter key was pressed
                if(text.includes("\n")) {
                    alert("Enter key pressed");
                }
            }}

            onChangeCountry={(code) => {
                setCountryCodePart(code.callingCode[0]);
            }}
            onChangeFormattedText={(text) => {
            }}
            withDarkTheme
            withShadow
            containerStyle={{
                borderRadius: 20,
                width: "80%",
                opacity: 0.8,
            }}
            textContainerStyle={{
                borderRadius: 20,
            }}
            textInputStyle={{
                fontSize: 22,
                fontFamily: "Red Hat Display Semi Bold",
            }}
            autoFocus={true}
        />

    </View>
}