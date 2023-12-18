import {useEffect} from "react";
import {NativeNavigate, NativeResetStack, clearNativeSession, notifyNativeOfSession} from "../utils/nativeBridge";

export default function Logout() {
  useEffect(() => {
	  NativeNavigate("Auth");
	  window.location.href = "/profile";
  }, []);

  return <div></div>;
}