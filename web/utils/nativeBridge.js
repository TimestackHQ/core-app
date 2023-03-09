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