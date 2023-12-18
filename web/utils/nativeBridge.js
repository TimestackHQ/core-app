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
