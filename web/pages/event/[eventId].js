import React, {Fragment, useEffect, useState} from 'react';
import IOS from "../../components/ios";
import FadeIn from "react-fade-in";
import HTTPClient, {restOrigin} from "../../utils/httpClient";
import {useRouter} from "next/router";
import MediaView from "../../components/MediaView";

export default function EventIOS ({}) {

	const eventId = useRouter().query.eventId;

	const [event, setEvent] = useState(null);

	const [media, setMedia] = useState([]);

	useEffect(() => {

		document.addEventListener("DOMContentLoaded", function() {
			const lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));

			if ("IntersectionObserver" in window) {
				const lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
					entries.forEach(function(video) {
						if (video.isIntersecting) {
							for (const source in video.target.children) {
								const videoSource = video.target.children[source];
								if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
									videoSource.src = videoSource.dataset.src;
								}
							}

							video.target.load();
							video.target.classList.remove("lazy");
							lazyVideoObserver.unobserve(video.target);
						}
					});
				});

				lazyVideos.forEach(function(lazyVideo) {
					lazyVideoObserver.observe(lazyVideo);
				});
			}
		});

		HTTPClient("/events/"+eventId, "GET")
			.then((response) => {
				setEvent(response.data.event);
			})
			.catch((error) => {
				window.location.href = "/main_ios";
			});
	}, []);
	return (
		<IOS buttons={[
			{
				icon: "leftArrow",
				href: "/main_ios",
				position: "left"
			},
			// {
			// 	icon: "leftArrow",
			// 	href: "/main_ios",
			// }
		]} timestackButtonLink={"./"+event?._id+"/upload"}>
			<FadeIn>
				<FadeIn delay={400}>
					<div className={"container row"}>
						<div className={"col-5"} autofocus={true}>
							<img src={event?.cover} style={{borderRadius: "15px", objectFit: "cover"}} alt={"Cassis 2022"} width={"100%"} height={"230px"}/>
						</div>
						<div className={"col-7"}>
							<h2 className={"overflow-auto"} style={{marginBottom: "0px", lineHeight: "1", maxHeight: "52px"}}><b>{event?.name}</b></h2>
							<p style={{fontSize: "12px", marginBottom: "0px", marginLeft: "2px"}}>{event?.location}</p>
							<p style={{fontSize: "12px", marginLeft: "2px"}}>June 17 - 21, 2022</p>
						</div>

					</div>
				</FadeIn>

				<br/>
				<br/>
				<div className={"row"}>
					{event?.media.map(file => {
						return (
							<div className={"col-4"} style={{margin: 0, padding: 1}}>
								<MediaView publicId={file}/>
							</div>
						);
					})}
				</div>
			</FadeIn>
		</IOS>
	);
}