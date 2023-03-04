import React, {useEffect} from "react";
import IOS from "../components/ios";
import { useRouter } from 'next/router'
import HTTPClient from "../utils/httpClient";
import EventCard from "../components/Event";
import FadeIn from "react-fade-in";

export default function MainIOS () {

	const [events, setEvents] = React.useState([]);

	useEffect(() => {
		HTTPClient("/events", "GET").then((res) => {
			setEvents(res.data.events);
		}).catch(err => {});
	}, [])

	const router = useRouter();

	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request: "session",
		session: window.localStorage.getItem("TIMESTACK_TOKEN")
	}));


	return (
		<IOS main={true}>
			<div className="container">
				<h1>My Timewall</h1>
				<div className="row" style={{paddingTop: "20px"}}>
					<div className={"col-12"} style={{borderRightColor: "black", borderWidth: "10px"}}>
						{events?.map((event, index) => {
							return <EventCard event={event} key={index}/>
						})}
						<br/>
						<br/>
						<br/>
						<br/>




					</div>


				</div>
			</div>
		</IOS>
	);
}