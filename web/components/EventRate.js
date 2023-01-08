export default function EventRate ({responded, total}) {
	// style={{color: responded/total === 1 ? "green" : "orange"}}
	return <div className={"col-12"} style={{color: "gray"}} >
		<i className={"fas fa-circle"}/> {responded}/{total}
	</div>
}