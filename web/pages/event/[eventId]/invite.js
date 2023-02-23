import Router, {useRouter} from "next/router";
import {useEffect} from "react";
import {v4} from "uuid";

export default function Invite() {
	const router = useRouter();

	useEffect(() =>{
		if(router.query.eventId) window.location.href = "timestack://event/" + router.query.eventId + "?invite=true&id="+v4();
		window.close();
	}, [router.query.eventId]);

	return (
		<div className={"container text-center"}>
			<br/>
			<img src={"/images/logotype-blacktimestack.svg"} alt={"Timestack"} className={"img-fluid"} style={{maxWidth: "200px"}}/>
			<br/>
			<br/>
			<h6>Opening app...</h6>

		</div>
	);
}