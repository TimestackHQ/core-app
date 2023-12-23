
import {useRouter} from "next/router";
import {useEffect} from "react";
import * as React from "react";
import Head from "next/head";
import {v4} from "uuid";

export default function UserLink() {
	const router = useRouter();

	const [isIOS, setIsIOS] = React.useState(false);


	useEffect(() =>{
		try {
			if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
				setIsIOS(true);
			}
			if(router.query.userId) window.location.href = "timestack://user/" + router.query.userId
		} catch (e) {
			console.log(e)
		}
	}, [router.query.userId]);

	return (
		<React.Fragment>
			{/*<Head>*/}
			{/*	<meta name="apple-itunes-app" content={"app-id=1671064881, app-argument="+String("timestack://user/" + router.query.userId)}/>*/}
			{/*	<meta name="apple-itunes-app" content={"app-id=1671064881"}/>*/}
			{/*</Head>*/}
			<div className={"container text-center"}>
				<br/>
				<img src={"/images/logotype-blacktimestack.svg"} alt={"Timestack"} className={"img-fluid"} style={{maxWidth: "200px"}}/>
				<br/>
				<br/>
				<h6>Opening app...</h6>
				<br/>
				{/* <h6>Link not working?</h6> */}
				{isIOS ? <a style={{borderRadius: "200px", width: "60%"}} href={"https://apps.apple.com/us/app/timestack/id1671064881"} className={"btn btn-primary"}>Download</a> : <a href={"https://play.google.com/store/apps/details?id=com.timestack"} className={"btn btn-primary"}>Download</a>}


			</div>
		</React.Fragment>

	);
}

export async function generateMetadata({ params: { lng } }) {

	const myTitle = "test";

	return {
		title: myTitle,
	};
}