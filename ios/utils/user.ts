import jwtDecode from 'jwt-decode';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function UserDetails() {
	try {
		return jwtDecode(await AsyncStorage.getItem('@session'));
	} catch (e) {
		return {};
	}
}