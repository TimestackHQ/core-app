import {useEffect} from "react";
import {NativeNavigate, NativeResetStack, notifyNativeOfSession} from "../utils/nativeBridge";

export default function Logout() {
  useEffect(() => {
	  window.localStorage.removeItem("TIMESTACK_TOKEN");
	  notifyNativeOfSession();
	  NativeNavigate("Auth");
	  window.location.href = "/auth";
  }, []);

  return <div></div>;
}