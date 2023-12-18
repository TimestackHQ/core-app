import { Text, StyleSheet, TouchableOpacity } from "react-native";

export default function LargeButton({
    notClickable,
    onPress,
    body,
    style,
    textStyle,
    fontSize = 15,
    width = "100%",
    variant = "default"
}: {
    notClickable?: boolean,
    onPress?: () => void,
    body: string,
    style?: any,
    textStyle?: any,
    fontSize?: number,
    width?: number | string,
    variant?: "default" | "pending" | "added" | "positive" | "negative"
}) {

    let buttonStyle: any = blackButton;
    if (variant === "pending") buttonStyle = StyleSheet.create({
        container: {
            backgroundColor: "#787880",
            opacity: 0.16
        },
        text: {
            color: "#FFFEFD",
            textAlign: "center",
            fontFamily: "Red Hat Display Semi Bold",
        },
    });

    else if (variant === "added") buttonStyle = StyleSheet.create({
        container: {
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#A6A6A6",
        },
        text: {
            color: "#A6A6A6",
            textAlign: "center",
            fontFamily: "Red Hat Display Semi Bold",
        }
    });

    else if (variant === "positive") buttonStyle = StyleSheet.create({
        container: {
            backgroundColor: "#007AFF",
        },
        text: {
            color: "white",
            textAlign: "center",
            fontFamily: "Red Hat Display Semi Bold",
        }
    });

    else if (variant === "negative") buttonStyle = StyleSheet.create({
        container: {
            backgroundColor: "#FF3B30",
        },
        text: {
            color: "white",
            textAlign: "center",
            fontFamily: "Red Hat Display Semi Bold",
        }
    });


    return <TouchableOpacity disabled={notClickable} onPress={onPress} style={{
        ...buttonStyle.container,
        ...style,
        borderRadius: fontSize * 2,
        width,
        justifyContent: "center",
        alignContent: "center",
    }}>
        <Text style={{
            ...buttonStyle.text,
            ...textStyle,
            fontSize,
            justifyContent: "center",
            alignContent: "center",
        }}>
            {body}
        </Text>
    </TouchableOpacity>
}

const blackButton = StyleSheet.create({
    container: {
        backgroundColor: "#ffffff",
    },
    text: {
        color: "#000000",
        textAlign: "center",
        fontFamily: "Red Hat Display Semi Bold",
        textShadowColor: "white",
        textShadowOffset: {
            width: 100,
            height: 100,
        },
        textShadowRadius: 9000,
        elevation: 50,

    }
})