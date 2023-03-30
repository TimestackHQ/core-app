import moment from "moment";

export const getTimezone = async () => {
	try {
		const timezone = await Intl.DateTimeFormat().resolvedOptions().timeZone;
		return timezone;
	} catch (error) {
		console.log('Error getting timezone:', error);
	}
};

export function dateFormatter(startDate, endDate = null) {
	let output = "";

	const start = moment(startDate, "MMMM DD YYYY");
	const end = endDate ? moment(endDate, "MMMM DD YYYY") : null;

	output += start.format("MMMM D");
	if (start.year() !== end?.year()) {
		output += `, ${start.year()}`;
	}

	if (end && start.year() === end?.year()) {
		if (start.format("M") === end.format("M")) {
			output += ` - ${end.format("D, YYYY")}`;
		} else {
			output += ` - ${end.format("MMMM D, YYYY")}`;
		}
	} else if (end) {
		output += ` - ${end.format("MMMM D, YYYY")}`;
	}

	return output;
}