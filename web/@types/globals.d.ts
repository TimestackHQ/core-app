declare global {
    namespace Window {
        interface ReactNativeWebView {
            postMessage: (data: string) => void;
        }
    }
}