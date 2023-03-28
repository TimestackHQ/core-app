import MediaView from "./MediaView";
import React from "react";
import HTTPClient from "../utils/httpClient";
import InfiniteScroll from "react-infinite-scroll-component";
import {NativeNavigate} from "../utils/nativeBridge";

export default function Gallery ({eventId}) {

	const [gallery, setGallery] = React.useState([]);
	const [moreToLoad, setMoreToLoad] = React.useState(true);

	const getGallery = () => HTTPClient(`/events/${eventId}/media?skip=${gallery.length}`, "GET")
		.then(res => {
			setGallery([...gallery, ...res.data.media]);
			if (res.data.media.length === 0) setMoreToLoad(false);
		});

	React.useEffect(() => {
		getGallery().then(_r => {});
		window?.addEventListener("message", messageRaw => {
			try {
				const message = messageRaw?.data ? JSON.parse(messageRaw?.data) : null;
				if(message.response === "modalDismissed") {
					try {
						getGallery();
					}catch(err){

					}
				}
			} catch (err) {
				console.log(err);
			}

		});
	}, []);



	return (
		<React.Fragment>
			<InfiniteScroll
				id="preload"
				className={"row "}
				dataLength={gallery.length} //This is important field to render the next data
				next={getGallery}
				hasMore={moreToLoad}
				loader={<h4></h4>}
				endMessage={
					<p style={{ textAlign: 'center' }}>
						<b></b>
					</p>
				}
				// below props only if you need pull down functionality
				refreshFunction={() => {
					setGallery([]);
					setMoreToLoad(true)
					getGallery();
				}}
				pullDownToRefreshThreshold={10}
				releaseToRefreshContent={
					<h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
				}
				style={{
					paddingTop: "30px",
					overflowY: "scroll",
					"-webkit-overflow-scrolling": "touch",
					"-webkit-transform": "translateZ(0px)",

				}}
			>
				{gallery?.map((media, i) => {
					return (
						<div onClick={() => NativeNavigate("MediaView", {
							mediaId: media._id,
							eventId: eventId
						})} key={i} className={"col-4"} style={{
							margin: 0,
							padding: 0.5,
							paddingLeft: i % 3 ? 0.5 : 0,
							paddingRight: i % 3 === 2 ? 0 : 0.5,
						}}>
							<MediaView media={media}/>
						</div>
					);
				})}
			</InfiniteScroll>
		</React.Fragment>
	);
}