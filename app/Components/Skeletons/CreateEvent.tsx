import { Text } from "react-native";
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import FontAwesomeIcon from '@expo/vector-icons/FontAwesome5';
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {useNavigation} from "@react-navigation/native";
import {AddScreenNavigationProp} from "../../navigation";

export default function CreateEvent() {

    const navigation = useNavigation<AddScreenNavigationProp>();

    return <TouchableOpacity style={{
        width: 120,
        height: 160
    }} onPress={() => navigation.navigate("Add")}>
        <View style={{
            flex: 1,
            backgroundColor: '#00000026',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 18,
            margin: 5
        }}>
            <MaterialIcon color={"white"} name="add" size={50} />
        </View>
    </TouchableOpacity>

}