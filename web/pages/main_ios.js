import React, {useEffect} from "react";
import IOS from "../components/ios";
import { useRouter } from 'next/router'
import HTTPClient from "../utils/httpClient";
import EventCard from "../components/Event";

export default function MainIOS () {

	const [events, setEvents] = React.useState([]);

	useEffect(() => {
		HTTPClient("/events", "GET").then((res) => {
			setEvents(res.data.events);
		});
	}, [])

	const router = useRouter();


	return (
		<IOS main={true}>
			<div className="container">
				<h1>My Timewall</h1>
				<div className="row" style={{paddingTop: "20px"}}>
					<div className={"col-10"} style={{borderRightColor: "black", borderWidth: "10px"}}>
						{events.map((event, index) => {
							return <EventCard key={index}/>
						})}
					</div>


				</div>
			</div>
		</IOS>
	);
}