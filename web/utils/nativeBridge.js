export default function NativeBridge (request, payload) {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request,
		...payload
	}));
}

export const openLink = link => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openLink",
	link
}));

export const notifyNativeOfSession = () => {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request: "session",
		session: window.localStorage.getItem("TIMESTACK_TOKEN")
	}));
}

export const NativeNavigate = (screen, params) => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "navigate",
	payload: [screen, params]
}));

export const NativeNavigateBack = () => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "navigateBack"
}));

export const NativeResetStack = () => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "resetStack"
}));

export const NativeOpenNativeLink = (link) => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openNativeLink",
	link
}));

export const NativeCancelEventInvite = (eventId) => {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request: "cancelEventInvite",
		eventId: eventId
	}));
}

export const EventButtonAction = (eventId) => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "eventButtonAction",
	eventId: eventId
}));

export const clearNativeSession = () => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "clearSession"
}));


