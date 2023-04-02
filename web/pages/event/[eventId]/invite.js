// import * as React from "react";
// import dynamic from 'next/dynamic'
//
//
// const DynamicHeader = dynamic(() => import('../../../components/Invite'), {
// 	ssr: false,
// })
//
// export default function Invite () {
// 	return <DynamicHeader />;
// }
import {useRouter} from "next/router";
import {useEffect} from "react";
import * as React from "react";
import Head from "next/head";
import {v4} from "uuid";

export default function Invite() {
	const router = useRouter();

	useEffect(() =>{
		// if(router.query.eventId) window.location.href = "timestack://event/" + router.query.eventId + "/join?id="+v4();
		// setTimeout(() => {
		// 	window.close();
		// }, 5000);
	}, [router.query.eventId]);

	return (
		<React.Fragment>
			<Head>
				<meta name="apple-itunes-app" content={"app-id=1671064881, app-argument="+String("timestack://event/" + router.query.eventId + "/join?id="+v4())}/>
				{/*<meta name="apple-itunes-app" content={"app-id=1671064881"}/>*/}
			</Head>
			<div className={"container text-center"}>
				<br/>
				<img src={"/images/logotype-blacktimestack.svg"} alt={"Timestack"} className={"img-fluid"} style={{maxWidth: "200px"}}/>
				<br/>
				<br/>
				<h6>Opening app...</h6>


			</div>
		</React.Fragment>

	);
}
