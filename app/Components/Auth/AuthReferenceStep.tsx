import {TextInput, TouchableOpacity, View} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {useEffect, useRef, useState} from "react";
import TextComponent from "../Library/Text";
import {AuthFormAction} from "../../screens/Auth";

export default function AuthReferenceStep({
    authMode,
    setAuthMode,
    setPhoneNumber,
    setEmailAuth,
    submitForm
}: {
    authMode: "EMAIL" | "PHONE_NUMBER",
    setAuthMode: (mode: "EMAIL" | "PHONE_NUMBER") => void,
    setEmailAuth: (email: string) => void,
    setPhoneNumber: (phoneNumber: string) => void,
    submitForm: (action: AuthFormAction) => void,
}) {

    const [email, setEmail] = useState<string>("");
    const [countryCodePart, setCountryCodePart] = useState<string>("1");
    const [phoneNumberPart, setPhoneNumberPart] = useState<string>("");

    useEffect(() => {
        setPhoneNumber("+"+countryCodePart + phoneNumberPart);
    }, [countryCodePart, phoneNumberPart]);

    useEffect(() => {
        setEmailAuth(email);
    }, [email]);


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
        {authMode === "PHONE_NUMBER" ? <PhoneInput
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
        /> : <TextInput
            autoFocus={true}
            autoComplete={"email"}
            keyboardType={"email-address"}
            returnKeyType='search'

            placeholder={"Email"}
            placeholderTextColor={"#a2a2a2"}
            style={{
                width: "100%",
                height: 50,
                borderRadius: 20,
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: "Red Hat Display Bold",
                marginTop: 20,
                fontSize: email.length > 0 ? 20 : 35,
            }}
            onChangeText={(text) => {
                setEmail(text)
            }}

        />}

        <TouchableOpacity onPress={() => {
            setAuthMode(authMode === "PHONE_NUMBER" ? "EMAIL" : "PHONE_NUMBER");
        }}>
            <TextComponent fontFamily={"Semi Bold"} fontColor={"white"} fontSize={15} numberOfLines={1} style={{
                marginTop: 35,
                letterSpacing: -0.5,
            }}>
                {authMode === "PHONE_NUMBER" ? "Use email instead ? (Login only)" : "Signup or login using your phone number"}
            </TextComponent>
        </TouchableOpacity>

    </View>
}