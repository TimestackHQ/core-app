import {useEffect} from "react";
import {NativeNavigate, NativeResetStack, clearNativeSession, notifyNativeOfSession} from "../utils/nativeBridge";

export default function Logout() {
  useEffect(() => {
	  window.localStorage.removeItem("TIMESTACK_TOKEN");
	  clearNativeSession();
	  NativeNavigate("Auth");
	  window.location.href = "/auth";
  }, []);

  return <div></div>;
}