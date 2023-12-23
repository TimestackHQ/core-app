export default function NativeBridge (request, payload) {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request,
		...payload
	}));
}

export const NativeNavigate = (screen, params) => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "navigate",
	payload: [screen, params]
}));


export const openLink = link => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openLink",
	link
}));


export const clearNativeSession = () => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "clearSession"
}));


