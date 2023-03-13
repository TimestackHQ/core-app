import {useEffect, useState} from "react";
import HTTPClient from "../utils/httpClient";
import Router, {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";
import {NativeNavigate} from "../utils/nativeBridge";

export default function AuthCheck({children}) {


	const dispatch = useDispatch();
	const user = useSelector(state => state.user);

	const router = useRouter();
	const isAuthPath = router.pathname.includes("/auth") ||
		router.pathname === "/contact" ||
		router.pathname ===  "/" ||
		router.pathname.endsWith("/invite");

	const [isValidSession, setIsValidSession] = useState(isAuthPath ? isAuthPath : false);

	useEffect(() => {
		if(!isAuthPath) HTTPClient("/auth/check", "GET")
			.then((res) => {
				dispatch({type: "SET_USER", payload: {
					...res.data
				}});
				setIsValidSession(true);
			})

			.catch(async (err) => {
				let eventId = window.location.pathname.split("/")[2];

				if(
					eventId && window.localStorage.getItem("TIMESTACK_TOKEN") &&
					(err.response?.data?.status === "waitlist" ||
						err.response?.data?.status === "unconfirmed")
				){
					await Router.push("/auth?eventId="+eventId);
					await NativeNavigate("Auth", []);
				} else {
					await Router.push("/auth");
					await NativeNavigate("Auth", []);

				}

				setIsValidSession(true);


			})
	}, [])

	return isValidSession ? <div>{children}</div> : <div/>;
}