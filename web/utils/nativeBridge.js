export default function NativeBridge (request, payload) {
	window.ReactNativeWebView?.postMessage(JSON.stringify({
		request,
		...payload
	}));
}

export function shareLink (link) {
	NativeBridge("shareLink", link);
}

export function shareRawLink (link) {
	NativeBridge("shareLink", {link});
}

export const openLink = link => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "openLink",
	link
}));

export const modalView = (type, payload) => window.ReactNativeWebView?.postMessage(JSON.stringify({
	request: "modalView",
	type,
	payload
}));

export const notifyNativeOfSession = () => {
	window.ReactNativeWebView.postMessage(JSON.stringify({
		request: "session",
		session: window.localStorage.getItem("TIMESTACK_TOKEN")
	}));
}

export const NativeNavigate = (screen, params) => window.ReactNativeWebView.postMessage(JSON.stringify({
	request: "navigate",
	payload: [screen, params]
}));

export const NativeNavigateBack = () => window.ReactNativeWebView.postMessage(JSON.stringify({
	request: "navigateBack"
}));

export const NativeResetStack = () => window.ReactNativeWebView.postMessage(JSON.stringify({
	request: "resetStack"
}));

export const EventButtonAction = (eventId) => window.ReactNativeWebView.postMessage(JSON.stringify({
	request: "eventButtonAction",
	eventId: eventId
}));