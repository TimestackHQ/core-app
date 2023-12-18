import {View} from "react-native";
import TextComponent from "../Library/Text";
import FastImage from "react-native-fast-image";
import SmallButton from "../Library/SmallButton";

export default function PrivacyAndTermsStep () {
    return         <View style={{
        flex: 1,
        flexDirection: "column",
    }}>



        <TextComponent
            fontFamily={"Athelas"}
            fontColor={"white"}
            fontSize={32}
            numberOfLines={2}

            style={{
                flex: 1,
                top: "40%",
                alignSelf: "center",
                justifyContent: "center",
                width: "60%",
                textAlign: "center",
                fontWeight: "bold",
                letterSpacing: -1.0,
                shadowColor: "white",
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                lineHeight: 30,
                shadowOpacity: 0.5,

            }}
        >
            We take privacy seriously.
        </TextComponent>

    </View>

}