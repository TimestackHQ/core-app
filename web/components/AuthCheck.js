import {useEffect, useState} from "react";
import HTTPClient from "../utils/httpClient";
import Router, {useRouter} from "next/router";
import {useDispatch, useSelector} from "react-redux";

export default function AuthCheck({children}) {


	const dispatch = useDispatch();
	const user = useSelector(state => state.user);

	const router = useRouter();
	const isAuthPath = router.pathname.includes("/auth") ||
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

			.catch((err) => {
				setTimeout(() => {
					let eventId = window.location.pathname.split("/")[2];

					if(
						eventId && window.localStorage.getItem("TIMESTACK_TOKEN") &&
						(err.response?.data?.status === "waitlist" ||
							err.response?.data?.status === "unconfirmed")
					){
						Router.push("/auth?eventId="+eventId);
					} else {
						router.push("/auth");
					}
				}, 1000);

			})
	}, [])

	return isValidSession ? <div>{children}</div> : <div/>;
}