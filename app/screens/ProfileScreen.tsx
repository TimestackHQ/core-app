import * as React from "react";
import Viewer from "../Components/Viewer";

export default function ProfileScreen({ navigation }) {
    return <Viewer navigation={navigation} baseRoute={"/profile"} />
}