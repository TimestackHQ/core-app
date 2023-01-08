import jwtDecode from "jwt-decode";

export const userInitRoutine = () => {
	try {
		const user = jwtDecode(window.localStorage.getItem("TIMESTACK_TOKEN"));
		return {
			_id: user?._id,
			firstName: user?.firstName,
			lastName: user?.lastName,
			phoneNumber: user?.phoneNumber,
			email: user?.email,
		}
	} catch (e) {
		return {

		};
	}
}