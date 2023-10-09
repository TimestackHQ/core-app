import FastImage from "react-native-fast-image";
import { View } from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

export default function ChatSpaceScreen() {
    return <View style={{
        flex: 1,
        backgroundColor: "white",
    }}>
        <FastImage source={require("../assets/mockup/group47.png")}
            style={{
                marginTop: 0.05 * height,
                width: "100%",
                height: "100%"
            }}
        />
    </View>
}