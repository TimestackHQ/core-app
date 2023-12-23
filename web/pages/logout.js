import {useEffect} from "react";
import {NativeNavigate,clearNativeSession} from "../utils/nativeBridge";

export default function Logout() {
  useEffect(() => {
	  NativeNavigate("Auth");
	  window.localStorage.removeItem("TIMESTACK_TOKEN");
	  clearNativeSession();

	  window.location.href = "/profile";
  }, []);

  return <div></div>;
}