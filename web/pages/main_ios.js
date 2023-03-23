import React, {useEffect} from "react";
import IOS from "../components/ios";
import { useRouter } from 'next/router'
import HTTPClient from "../utils/httpClient";
import EventCard from "../components/Event";
import FadeIn from "react-fade-in";
import InfiniteScroll from "react-infinite-scroll-component";

export default function MainIOS () {

	const [events, setEvents] = React.useState([]);
	const [query, setQuery] = React.useState("");
	const [loading, setLoading] = React.useState(true);

	const getEvents = (searching, query) => {
		const clean = searching && query !== "";
		HTTPClient(`/events?skip=${clean ? 0 : events.length}`+String(query ? "&q="+query : ""), "GET").then((res) => {
			if(res.data.events.length !== 0) setEvents(clean ? [...res.data.events] : [...events, ...res.data.events]);
			setLoading(false);
		}).catch(err => {
			alert("An error occurred while loading your events. Please try again later.")
		})
	}

	useEffect(() => {
		getEvents();
	}, []);


	return (
		// <IOS main={true}>
		<div style={{backgroundColor: "white"}}>
			<FadeIn >
				<header style={{backgroundColor: "white", paddingBottom: "8px", paddingTop: 12}} className="d-flex flex-wrap mb-4 row fixed-top ">

					<div className={"col-2"}>
						<img style={{marginLeft: "20px"}} src="/icons/logo blacktimestack.svg" alt="logo" width="25px"/>
					</div>
					<div className={"col-9"}>
						<input
							className={"form-control form-control-sm"}
							style={{backgroundColor: "#EFEFF0", borderRadius: "10px", marginTop: "3px"}}
							type="text"
							placeholder="Search"
							onChange={(e) => {
								setQuery(e.target.value);
								getEvents(true, e.target.value);
							}}
							value={query}
						/>
					</div>
				</header>
				<br/>
			</FadeIn>
			<div style={{height: "40px"}}/>

			<div className="container">
				<h1>My Timewall {query}</h1>
				<div className="row" style={{paddingTop: "20px"}}>
					<div className={"col-12"} style={{borderRightColor: "black", borderWidth: "10px"}}>
						{loading ? <React.Fragment>
							{[0, 1, 2, 3].map((event, index) => {
								return <div key={index} style={{
									height: "145px",
									width: "100%",
									borderRadius: "15px 15px 15px 15px",
									backgroundColor: "#f8f8f8",
									marginBottom: "15px"
								}}/>
							})}
						</React.Fragment> : <InfiniteScroll
							dataLength={events.length}
							next={getEvents}
							hasMore={true}
							loader={<h4></h4>}
						>
							{events?.map((event, index) => {
								return <EventCard key={index} event={event}/>
							})}
						</InfiniteScroll>}

					</div>


				</div>
			</div>
		</div>
	);
}