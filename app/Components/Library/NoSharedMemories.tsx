import { Text, View } from "react-native";
import FastImage from "react-native-fast-image";

export default function NoSharedMemories() {
    return <View style={{ flexDirection: "column", justifyContent: "flex-start", alignContent: "center", }}>
        <FastImage
            resizeMode="contain"
            source={require("../../assets/icons/collection/hour-glass.png")}
            style={{ width: 80, height: 80, alignSelf: "center", marginTop: "50%" }}
        />
        <Text
            style={{
                fontFamily: "Red Hat Display Semi Bold",
                fontSize: 22,
                textAlign: "center",
                marginTop: 10,
                color: "#8E8E93"
            }}
        >
            No shared memories
        </Text>
    </View>
}