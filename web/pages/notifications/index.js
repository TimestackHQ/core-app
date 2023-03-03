import React from "react";
import IOS from "../../components/ios";
import HTTPClient from "../../utils/httpClient";
import EventCard from "../../components/Event";
import EventPad from "../../components/EventPad";
import NotificationsPageSuspense from "../../components/Suspense/NotificationsPageSuspense";
import InfiniteScroll from "react-infinite-scroll-component";

export default function NotificationsPage() {

	const [invites, setInvites] = React.useState([]);
	const [notifications, setNotifications] = React.useState([]);
	const [loaded, setLoaded] = React.useState(false);
	const [loadedAllNotifications, setLoadedAllNotifications] = React.useState(false);

	const getNotifications = () => HTTPClient(`/notifications?skip=${notifications?.length}`, "GET").then((res) => {
		setNotifications([...notifications, ...res.data]);
		setLoaded(true);
	});

	React.useEffect(() => {
		HTTPClient("/events/invites", "GET").then((res) => {
			setInvites(res.data.events);
			setLoaded(true);
		}).catch(err => {});

		getNotifications().then(r => {});

	}, [])


	return (
		<IOS buttons={
			[
				{
					icon: "leftArrow",
					href: "/main_ios",
					position: "left"
				},
			]
		}>
			{loaded ? <div className="container">
				<div className="row flex-nowrap " style={{
					// position: "absolute",
					// top: "40px",
					marginTop: "-40px",
					padding: "10px",
					borderRightColor: "black",
					borderWidth: "10px",
					overflowX: "scroll",
				}}>
					{invites?.map((event, index) => {
						return <EventPad event={event} key={index}/>

					})}
					{invites?.map((event, index) => {
						return <EventPad event={event} key={index}/>

					})}
				</div>
				<div className={"row"} style={{padding: "10px", paddingTop: "0px"}}>
					<div className={"col-6"} style={{
						marginTop: "5px",
						margin: 0

					}}>
						<h5 style={{}}>{invites.length} {invites.length === 1 ? "New event" : "New events"}</h5>
					</div>
					<div className={"col-6"} >
						<button className={"btn btn-dark btn-sm white-shadow"} style={{float: "right", fontWeight: "500", width: "100px"}}>Join all</button>
					</div>
					<hr style={{marginLeft: "10px", marginRight: "10px", marginTop: "5px", width: "95%"}}/>
					<div className={"col-12"} style={{
						height: "10px",
					}}>
						<h5 style={{}}>{notifications.length} {notifications.length === 1 ? "Notification" : "Notifications"}</h5>


						<InfiniteScroll
							dataLength={notifications.length} //This is important field to render the next data
							next={getNotifications}
							hasMore={true}
							loader={<h4>Loading...</h4>}
							endMessage={
								<p style={{ textAlign: 'center' }}>
									<b>Yay! You have seen it all</b>
								</p>
							}
							// below props only if you need pull down functionality
							refreshFunction={() => {
								setNotifications([]);
								getNotifications();
							}}
							pullDownToRefresh
							pullDownToRefreshThreshold={10}
							pullDownToRefreshContent={
								<h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
							}
							releaseToRefreshContent={
								<h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
							}
						>
							{notifications?.map((notification, index) => {
									return <div key={index}>
									<h5>{notification.title}</h5>
									<p>{notification.body}</p>
									<hr/>
								</div>
							})}
						</InfiniteScroll>
					</div>

				</div>
			</div> : <NotificationsPageSuspense/>}
		</IOS>
	);
}