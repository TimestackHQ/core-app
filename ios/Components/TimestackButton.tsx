import { useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import FastImage from "react-native-fast-image"

export default function TimestackButton({ color, size, focused }: { color: string, size: number, focused: boolean }) {

    const route = useRoute();

    useEffect(() => {
        console.log(route.name);
    }, [route]);

    if (focused) return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />
    return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />

}