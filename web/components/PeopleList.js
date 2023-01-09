import AvailabilityMetric from "./AvailabilityMetric";

export default function PeopleList ({event, people}) {
	return event?.users?.sort((a, b) => a.firstName - b.firstName).map((person, i) => (
		<h6 key={i} className={"ml-2"}>
			<img style={{border: "1px solid black", borderRadius: "5px"}} width={"25px"} src={"/images/default.png"}/> {person.firstName} {person.lastName} <AvailabilityMetric
			userId={person._id}
			availabilities={event.availabilities}
		/>
		</h6>

	))
}
