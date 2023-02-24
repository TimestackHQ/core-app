import {useEffect, useState} from "react";
import HTTPClient from "../utils/httpClient";
import {useRouter} from "next/router";
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
				setIsValidSession(true);
				dispatch({type: "SET_USER", payload: {
					...res.data
				}});
			})

			.catch((err) => {
				setIsValidSession(true);
				router.push("/auth");
			})
	}, [])

	return isValidSession ? <div>{children}</div> : <div/>;
}