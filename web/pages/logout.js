import {useEffect} from "react";
import {notifyNativeOfSession} from "../utils/nativeBridge";

export default function Logout() {
  useEffect(() => {
	  window.localStorage.removeItem("TIMESTACK_TOKEN");
	  notifyNativeOfSession();
	  window.location.href = "/auth";
  }, []);

  return <div></div>;
}