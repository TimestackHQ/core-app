import {useEffect, useState} from "react";
import HTTPClient from "../utils/httpClient";
import {useRouter} from "next/router";

export default function AuthCheck({children}) {

	const router = useRouter();
	const isAuthPath = router.pathname.includes("/auth") ||
		router.pathname ===  "/" ||
		router.pathname.endsWith("/invite");

	const [isValidSession, setIsValidSession] = useState(isAuthPath ? isAuthPath : false);

	useEffect(() => {
		if(!isAuthPath) HTTPClient("/auth/check", "GET")
			.then((res) => {
				setIsValidSession(true);

			})
			.catch((err) => {
				setIsValidSession(true);
				router.push("/auth");
			})
	}, [])

	return isValidSession ? <div>{children}</div> : <div/>;
}