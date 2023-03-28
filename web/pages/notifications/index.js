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
import EventInviteNotification from "../../components/notifications/EventInviteNotification";
import NewLoginNotification from "../../components/notifications/NewLoginNotification";
import {useDispatch} from "react-redux";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US')


export default function NotificationsPage() {

	const dispatch = useDispatch();
	const [invites, setInvites] = React.useState([]);
	const [notifications, setNotifications] = React.useState([]);
	const [loaded, setLoaded] = React.useState(false);
	const [loadedAllNotifications, setLoadedAllNotifications] = React.useState(false);

	const getNotifications = () => HTTPClient(`/notifications?skip=${notifications?.length}`, "GET").then((res) => {
		setNotifications([...notifications, ...res.data]);
		setLoaded(true);
		if (res.data.length !== 0) {
			HTTPClient("/notifications/read", "POST", {
				notificationIds: []
			}).then((res) => {
				HTTPClient("/notifications/count", "GET")
					.then(res => {
						dispatch({
							type: "SET_NOTIFICATION_COUNT",
							payload: res.data.count
						});
					})
			})
		}
	});

	React.useEffect(() => {
		HTTPClient("/events/invites", "GET").then((res) => {
			setInvites(res.data.events);
			setLoaded(true);
		}).catch(err => {});

		getNotifications().then(r => {});

	}, [])


	return (
		<div>
			{loaded ? <div className="container">
				<div className="row flex-nowrap " style={{
					// position: "absolute",
					// top: "40px",
					padding: "5px",
					paddingRight: "0px",
					borderRightColor: "black",
					borderWidth: "10px",
					overflowX: "scroll",
					"::-webkit-scrollbar": { width: "0px", height: "0px" }
				}}>
					{invites?.map((event, index) => {
						return <EventPad event={event} key={index}/>

					})}

				</div>
				<div className={"row"} style={{padding: "5px", paddingTop: "5px", paddingRight: "0px"}}>
					{invites.length !== 0 ? <div className={"col-6"} style={{
						marginTop: "5px",
						margin: 0

					}}>
						<h5 style={{paddingTop: "5px"}}>{invites.length} {invites.length === 1 ? "New event" : "New events"}</h5>
					</div>: null}
					{invites.length !== 0 ? <div className={"col-6"} >
						<button className={"btn btn-dark btn-sm white-shadow"} style={{float: "right", fontWeight: "500", width: "100px", marginRight: "5px"}}>Join all</button>
					</div>: null}
					{invites.length !== 0 ? <hr style={{marginLeft: "10px", marginRight: "10px", marginTop: "5px", width: "92%"}}/> : null}
					<div className={"col-12"} style={{
						paddingTop: "-50px",
						marginRight: "-5px",
						paddingRight: "0px",
						height: "10px",
					}}>
						<h1>Notifications</h1>
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
							style={{overflowX: "hidden", overflow: "scroll", height: "100%", width: "100%", "::-webkit-scrollbar": { width: "0px", height: "0px" }}}
						>
							{notifications?.map((notification, index) =>    {
								const type = notification.data.type;
								const ago = timeAgo.format(moment(notification.createdAt).toDate(), "mini")
								if(type === "login") return <NewLoginNotification
									key={index}
									notification={notification}
									timeAgo={ago}
								/>;
								return <EventInviteNotification
									style={{overflowX: "hidden"}}
									key={index}
									notification={notification}
									timeAgo={ago}
								/>
							})}
						</InfiniteScroll>

					</div>

				</div>
			</div> : <NotificationsPageSuspense/>}
		</div>
	);
}