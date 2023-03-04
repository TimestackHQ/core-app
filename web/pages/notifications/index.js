import React from "react";
import IOS from "../../components/ios";
import HTTPClient from "../../utils/httpClient";
import EventCard from "../../components/Event";
import EventPad from "../../components/EventPad";
import NotificationsPageSuspense from "../../components/Suspense/NotificationsPageSuspense";
import InfiniteScroll from "react-infinite-scroll-component";
import Profile from "../../profile";
import ProfilePicture from "../../components/ProfilePicture";
import TimeAgo from 'javascript-time-ago'

// English.
import en from 'javascript-time-ago/locale/en'
import moment from "moment/moment";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US')


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
					padding: "5px",
					paddingRight: "0px",
					borderRightColor: "black",
					borderWidth: "10px",
					overflowX: "scroll",
				}}>
					{invites?.map((event, index) => {
						return <EventPad event={event} key={index}/>

					})}
				})}

				</div>
				<div className={"row"} style={{padding: "5px", paddingTop: "5px", paddingRight: "0px"}}>
					<div className={"col-6"} style={{
						marginTop: "5px",
						margin: 0

					}}>
						<h5 style={{paddingTop: "5px"}}>{invites.length} {invites.length === 1 ? "New event" : "New events"}</h5>
					</div>
					<div className={"col-6"} >
						<button className={"btn btn-dark btn-sm white-shadow"} style={{float: "right", fontWeight: "500", width: "100px", marginRight: "5px"}}>Join all</button>
					</div>
					<hr style={{marginLeft: "10px", marginRight: "10px", marginTop: "5px", width: "92%"}}/>
					<div className={"col-12"} style={{
						paddingTop: "-50px",
						marginRight: "-5px",
						paddingRight: "0px",
						height: "10px",
					}}>
						<InfiniteScroll
							dataLength={notifications.length} //This is important field to render the next data
							next={getNotifications}
							hasMore={true}
							loader={<h4></h4>}
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
									return (
										<div className={"row"} key={index} style={{paddingBottom: "3px", paddingTop: "10px"}}>
											<div className={"col-2"}>
												<ProfilePicture width={"45px"} height={"45px"} location={notification?.userProfilePicture}/>
											</div>
											<div className={"col-8"} style={{marginLeft: "-10px", marginTop: "5px"}}>
												<h6 style={{fontSize: "14px", width: "90%"}}>{notification.title}: {notification.body}</h6>
											</div>
											<div className={"col-1"} style={{marginLeft: "-35px", height: "100%", color: "gray", marginTop: "12px", display: "flex", justifyContent: "flex-end"}}>
												<b style={{fontSize: "12px", display: "flex", justifyContent: "flex-end"}}>{timeAgo.format(moment(notification.createdAt).toDate(), "mini")}</b>
											</div>
											<div className={"col-1"} style={{marginLeft: "-20px"}}>
												<div style={{backgroundColor: "#E41E1E", width: "5px", height: "5px", borderRadius: "10px", marginLeft: "62px", marginTop: "20px"}}/>
												<img src={notification.eventCover} style={{width: "40px", height: "55px", borderRadius: "4px", marginTop: "-35px", marginLeft: "15px"}}/>

											</div>

										</div>
									);
							})}
						</InfiniteScroll>
					</div>

				</div>
			</div> : <NotificationsPageSuspense/>}
		</IOS>
	);
}