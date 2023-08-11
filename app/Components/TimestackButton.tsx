import { useRoute } from "@react-navigation/native";
import { useEffect, useRef } from "react";
import FastImage from "react-native-fast-image"
import { useAppSelector } from "../store/hooks";
import { View } from "react-native";

export default function TimestackButton({ color, size, focused }: { color: string, size: number, focused: boolean }) {

    const route = useRoute();
    const rollState = useAppSelector(state => state.rollState);


    useEffect(() => {
        console.log(route.name);
    }, [route]);

    useEffect(() => {
        console.log(rollState);
    }, [rollState]);

    if (rollState.holderType === "socialProfile") return (
        <View style={{}}>

            <FastImage resizeMode='cover' style={{ width: 20, height: 20, zIndex: 1, position: "absolute", right: 0, borderRadius: 20, top: -5, borderColor: "white", borderWidth: 1.5 }} source={{ uri: rollState.holderImageUrl }} />
            <FastImage resizeMode='contain' style={{ width: 40, height: 40, zIndex: 0 }} source={require("../assets/icons/collection/timestack.png")} />

        </View>
    )
    if (focused) return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />
    return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />

}