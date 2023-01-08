import * as chrono from "chrono-node";
import moment from "moment/moment";
import * as Joi from "joi";

export function Prediction(requestRaw) {

	// initial layer of parsing. Replaces edge cases with more common words
	// and processes time when pm or am

	let request = requestRaw;
	request = request.replace("after tomorrow", "in 2 days")

	request = request.replace(",", "").trim().split(" ");
	request.forEach((word, index) => {
		if (Number(word) > 0 && Number(word) < 7 && ["at", "from", "to"].includes(request?.[index-1])) request[index] = String(word)+"pm";
	});
	request = request.join(" ");

	// date parsing layer. Gets all dates from the request and returns them in an array
	const timeNlp = chrono.parse(request, moment().startOf("day").toDate(), { forwardDate: true });

	const timeRanges = timeNlp.map((time) => {
		request = request.replace(time.text, "");
		return {
			start: moment(time.start.date()).toDate(),
			end: time.end
				? moment(time.end.date()).unix() <= moment(time.start.date()).unix()
					? moment(time.end.date()).add(12, "hours").toDate()
					: moment(time.end.date()).toDate()
				: moment(time.start.date()).hour() === 0
					? moment(time.start.date()).endOf("day").toDate()
					: moment(time.start.date()).add(2, "hours").toDate(),
			text: time.text
		}
	});

	// prepositions layer. Removes prepositions from the request
	request = request.replace(",", "").trim().split(" ");

	["at", "with", "and", "in", "next", "from", "to", "on", "as", "well"].forEach((preposition) => {
		request = request.filter((word) => word !== preposition);
	})

	/// contacts layer. Gets all contacts from the request and returns them in an array
	const contacts = [];

	const emailValidator = Joi.string().email({ tlds: { allow: false } }).required()
	request = request.filter((word, i) => {

		if(!emailValidator.validate(word).error) {
			contacts.push(word);
			return false
		}
		return true

	});

	request = request.filter((word, i) => {

		if(String(Number(word)).length === 10) {
			contacts.push(word);
			return false
		}
		return true

	});


	// removes empty spaces from the request
	request = request.filter(list => list.length !== 0)

	// gets the rest as name of the event
	const name = request.join(", ").replace(",", "").replace(".", "").trim();

	return {
		name: name,
		timeRanges: timeRanges,
		contacts: contacts
	}
}
