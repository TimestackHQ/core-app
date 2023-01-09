import {useEffect} from "react";

export default function Logout() {
  useEffect(() => {
	  	window.localStorage.removeItem("TIMESTACK_TOKEN");
		window.location.href = "/auth";
  }, []);

  return <div></div>;
}