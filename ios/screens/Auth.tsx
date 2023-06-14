import { frontendUrl } from "../utils/io";
import Main from "../Main";

export default function AuthScreen({ navigation, route }) {

    return <Main
        baseRoute={"/auth"}
        frontendUrl={frontendUrl}
        navigation={navigation}
    />;
}
