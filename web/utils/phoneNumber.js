
export const CleanUpPhoneNumber = (phoneNumber) => {
	if(!phoneNumber) return "";
	return phoneNumber.replace(/\D/g,'')
}