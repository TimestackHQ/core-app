import {View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity} from "react-native";
import FastImage from "react-native-fast-image";
import Home from "../Components/Auth/Home";
import TextComponent from "../Components/Library/Text";
import Animated, {useSharedValue, withTiming, Easing, useAnimatedStyle} from "react-native-reanimated";
import {useEffect, useState} from "react";
import LargeButton from "../Components/Library/LargeButton";
import AuthPhoneNumberStep from "../Components/Auth/PhoneNumber";
import {useMutation, useQuery} from "react-query";
import {confirmLogin, initLogin} from "../queries/auth";
import CodeStep from "../Components/Auth/Code";
import NameStep from "../Components/Auth/Name";
import {HTTPConfirmLoginQueryResponse, HTTPErrorMessageResponse} from "@api-types/*";
import PrivacyAndTermsStep from "../Components/Auth/PrivacyAndTerms";
import {useAppDispatch} from "../store/hooks";
import {setAuthToken as setStoreAuthToken} from "../store/userState";
import {MainScreenNavigationProp} from "../navigation";
import {useNavigation} from "@react-navigation/native";

export type AuthStep = "HOME" | "PHONE_NUMBER" | "CODE" | "PRIVACY_AND_POLICY" | "NAME" | "EMAIL" | "PASSWORD";
export type AuthFormAction = "INIT_LOGIN" | "CONFIRM_LOGIN"
export default function AuthScreen() {

    const dispatch = useAppDispatch();
    const navigation = useNavigation<MainScreenNavigationProp>();

    const logoHeight = useSharedValue(0);

    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    const [step, setStep] = useState<AuthStep>("HOME");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [authCode, setAuthCode] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const initLoginPost = useMutation({
        mutationFn: initLogin,
        onSuccess: (data) => {
            setStep("CODE");
        }
    });

    const confirmLoginPost = useMutation({
        mutationFn: confirmLogin,
        onSuccess: (data: HTTPConfirmLoginQueryResponse | HTTPErrorMessageResponse) => {
            if ("message" in data) {
                new Alert.alert( "Error",data.message);
            } else {
                if(data.userConfirmed) {
                    dispatch(setStoreAuthToken(data.token))
                    navigation.navigate("Main");
                    return;
                }
                setStep("PRIVACY_AND_POLICY");
            }
        },
        onError: (error) => {
            console.log(error);
            alert(JSON.stringify(error));
        }
    });




    useEffect(() => {
        logoHeight.value = step === "HOME" ? 100 : 30
    }, [step]);

    const truncatedAnimation = useAnimatedStyle(() => {
        return {
            height: withTiming(logoHeight.value, {
                duration: 600,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
        };
    }, []);

    const submitForm = (action: AuthFormAction) => {
        switch (action) {
            case "INIT_LOGIN":
                initLoginPost.mutate({
                    phoneNumber: phoneNumber,
                });
                break;
            case "CONFIRM_LOGIN":
                confirmLoginPost.mutate({
                    username: phoneNumber,
                    code: authCode,
                });
                break;
            default:
                break;


        }
    }

    return <View style={{flex: 1}}>



        <SafeAreaView style={{
            flex: 1,
            zIndex: 1,
        }}>


            <Animated.View
                style={[{
                    // flex: 1,
                    alignSelf: "center",
                    width: "100%",
                }, truncatedAnimation]}
            >

                {step !== "HOME" ? <TouchableOpacity
                    onPress={() => {
                        if (step === "PHONE_NUMBER") setStep("HOME");
                        else if (step === "CODE") setStep("PHONE_NUMBER");
                        else if (step === "PRIVACY_AND_POLICY") setStep("CODE");
                        else if (step === "NAME") setStep("PRIVACY_AND_POLICY");
                        else if (step === "EMAIL") setStep("NAME");
                        else if (step === "PASSWORD") setStep("EMAIL");
                    }}
                    style={{
                    zIndex: 1,
                    position: "absolute",
                    left: 20,
                }}>
                    <FastImage source={require("../assets/icons/arrow_back_ios_FILL1_wght300_GRAD0_opsz48-white.png")} resizeMode={FastImage.resizeMode.contain} style={{
                        width: 30,
                        height: 30,
                        // marginTop: 20,

                    }}/>
                </TouchableOpacity> : null}

                {step === "HOME" ? <TextComponent fontFamily={"Semi Bold"} fontColor={"white"} fontSize={20} numberOfLines={1}  style={{
                    marginTop: 20,
                    textAlign: "center",
                }}>
                    Beta Version
                </TextComponent> : null}
                <FastImage source={require("../assets/covers/logo.png")} resizeMode={FastImage.resizeMode.contain} style={{
                    width: "50%",
                    height: "100%",
                    alignSelf: "center",
                }} />
            </Animated.View>


            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // You can adjust this offset as needed
            >
                <View style={{
                    flex: 5,
                }}>
                    {step === "HOME" ? <Home /> : null}
                    {step === "PHONE_NUMBER" ? <AuthPhoneNumberStep
                        setPhoneNumber={setPhoneNumber}
                        submitForm={submitForm}
                    /> : null}
                    {step === "CODE" ? <CodeStep
                        resendCode={() => {
                            submitForm("INIT_LOGIN");
                        }}
                        setAuthCode={setAuthCode}
                        phoneNumber={phoneNumber}
                    /> : null}
                    {step === "PRIVACY_AND_POLICY" ? <PrivacyAndTermsStep /> : null}
                    {step === "NAME" ? <NameStep
                        firstName={firstName}
                        lastName={lastName}
                        setFirstName={setFirstName}
                        setLastName={setLastName}
                    /> : null}
                </View>
                <View style={{
                    flex: 1,
                    alignSelf: "center",
                    width: "90%",
                    flexDirection: "column-reverse",
                    paddingBottom: 20,
                }}>

                    <LargeButton disabled={buttonDisabled} fontSize={20} body={String(
                        step === "HOME" ? "START" : "CONTINUE"
                    )} onPress={() => {
                        if(step === "HOME") setStep("PHONE_NUMBER");
                        if(step === "PHONE_NUMBER") submitForm("INIT_LOGIN");
                        if(step === "CODE") submitForm("CONFIRM_LOGIN");
                    }} textStyle={{
                        fontFamily: "Red Hat Display Semi Bold",
                    }} style={{
                        paddingVertical: 10,
                        width: "60%",
                        shadowColor: "white",
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                    }}/>
                    <TextComponent fontFamily={"Semi Bold"} fontColor={"white"} fontSize={15} numberOfLines={2} style={{
                        marginBottom: 10,
                        textAlign: "center",
                        width: "80%",
                        alignSelf: "center",
                    }}  >
                        {step === "PHONE_NUMBER" ? "This is how we keep yout account safe." : null}
                        {step === "CODE" ? "This code is only for you." : null}
                        {step === "PRIVACY_AND_POLICY" ? "By clicking “CONTINUE”, you agree to our Privacy Policy and Terms of Service." : null}

                    </TextComponent>
                </View>
            </KeyboardAvoidingView>

        </SafeAreaView>

        <FastImage
            source={require("../assets/covers/auth-2.png")}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.backgroundImage}
        />


    </View>
}

const styles = StyleSheet.create({
    backgroundImage: {
        position: "absolute",
        top: -20,
        width: "100%",
        height: "110%",
    }
})