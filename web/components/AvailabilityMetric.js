export default function AvailabilityMetric ({userId, availabilities: allAvailabilities}) {

	const availabilities = allAvailabilities?.filter(availability => availability.users.includes(userId));
	if(availabilities.length === 0) {
		return <i className={"fa-regular fa-circle-question"} style={{color: "orange"}}/>
	}

	const uniqueInAllEvents = allAvailabilities.filter(availability =>
		availability.users.length === 1 &&
		availability.users.includes(userId)
	);

	// if(uniqueInAllEvents.length === availabilities.length) {
	// 	return <i className="fa-solid fa-circle-xmark" style={{color: "red"}}/>
	// }
	return <i style={{color: "green"}} className="fa-regular fa-circle-check"></i>;
}