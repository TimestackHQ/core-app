export const getTimezone = async () => {
	try {
		const timezone = await Intl.DateTimeFormat().resolvedOptions().timeZone;
		return timezone;
	} catch (error) {
		console.log('Error getting timezone:', error);
	}
};