import { Image, Text, View } from "react-native";

export function ErrorScreen() {

    return <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <Image
            style={{
                width: 300,
            }}
            source={require("../assets/i-thought-we-had-a-connection-connection.gif")}
        />
        <Text style={{
            marginTop: 40,
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 25,
            color: "gray"
        }}>
            Can’t connect
        </Text>
        <Text style={{
            textAlign: 'center',
            fontFamily: "Red Hat Display Semi Bold",
            fontSize: 20,
            color: "gray"
        }}>
            Make sure you are connected to the internet.
        </Text>
    </View>
}