export default function AvailabilityRate ({users, availability}) {
	return availability.users.length === 0 ? null : <div style={{color: availability.users.length/users.length === 1 ? "green" : "orange"}} className={"col-12"}>
		<i className={"fas fa-circle"}/> <b>
		{availability.users.length}/{users.length} {availability.users.length === 1 ? "person" : "people"} available</b>
	</div>
}