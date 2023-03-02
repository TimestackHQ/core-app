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