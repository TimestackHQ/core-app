import {TextInput, TouchableOpacity, View} from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {useEffect, useRef, useState} from "react";
import TextComponent from "../Library/Text";
import {AuthFormAction} from "../../screens/Auth";

export default function CodeStep({
    authMode,
    setAuthCode,
    phoneNumber,
    resendCode,
    emailAuth,
}: {
    authMode: "EMAIL" | "PHONE_NUMBER",
    setAuthCode: (code: string) => void,
    resendCode: () => void,
    phoneNumber: string,
    emailAuth: string,
}) {

    const [timeRemaining, setTimeRemaining] = useState<number>(30);

    useEffect(() => {
        if(timeRemaining <= 0) return;
        setTimeout(() => {
            setTimeRemaining(timeRemaining - 1);
        }, 1000);
    }, [timeRemaining]);

    return <View style={{
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "25%",
    }}>

        {authMode === "PHONE_NUMBER" ? <TextComponent
            fontFamily={"Semi Bold"}
            fontColor={"white"}
            fontSize={20}
            numberOfLines={2}

            style={{
                marginBottom: 10,
                letterSpacing: -0.5,
                width: "80%",
                textAlign: "center",
            }}
        >
            Enter the code we sent to {phoneNumber}
        </TextComponent> : <TextComponent
            fontFamily={"Semi Bold"}
            fontColor={"white"}
            fontSize={20}
            numberOfLines={2}

            style={{
                marginBottom: 10,
                letterSpacing: -0.5,
                width: "80%",
                textAlign: "center",
            }}
        >
            Enter the code we sent to {emailAuth}
        </TextComponent>}
        <TextInput
            autoFocus={true}
            autoComplete={"one-time-code"}
            keyboardType={"number-pad"}
            returnKeyType='search'

            placeholder={"●●●●●●"}
            placeholderTextColor={"#737373"}
            maxLength={6}
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
                setAuthCode(text);
            }}

        />
        <TouchableOpacity disabled={timeRemaining > 0} onPress={() => {
            setTimeRemaining(30);
            resendCode();
        }}>
            <TextComponent
                fontFamily={"Semi Bold"}
                fontColor={timeRemaining <= 0 ? "white" : "#737373"}
                fontSize={15}
                numberOfLines={1}
                style={{
                    marginTop: 35,
                    letterSpacing: -0.5,
                }}
            >
                Resend code {timeRemaining <= 0 ? "" : `in ${timeRemaining} sec`}
            </TextComponent>
        </TouchableOpacity>

    </View>
}