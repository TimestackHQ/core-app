import {useEffect, useState} from "react";
import HTTPClient from "../utils/httpClient";
import {useRouter} from "next/router";

export default function AuthCheck({children}) {

	const router = useRouter();
	const isAuthPath = router.pathname.includes("/auth")

	const [isValidSession, setIsValidSession] = useState(isAuthPath);

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