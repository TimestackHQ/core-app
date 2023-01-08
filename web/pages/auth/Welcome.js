import * as React from 'react';
import FadeIn from "react-fade-in";
import jwtDecode from "jwt-decode";
import {useRouter} from "next/router";
import {useSelector} from "react-redux";

export default function Welcome () {

	const router = useRouter();
	const user = useSelector(state => state.user);

	setTimeout(() => {
		router.push("/");
	}, 1000);

	return (
		<div>
			<FadeIn>
				<div style={{paddingTop: "200px"}}/>
				<h2 className={"h2 mb-3 text-center"}>Welcome back {user.firstName} 🎊</h2>
				<hr/>
				Loading...
			</FadeIn>
		</div>
	);
}