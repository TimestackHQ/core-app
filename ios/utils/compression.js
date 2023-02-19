import * as FileSystem from "expo-file-system";
import {FFmpegKit} from "ffmpeg-kit-react-native";

const getResultPath = async () => {
	const videoDir = `${FileSystem.cacheDirectory}tmp/`;

	// Checks if gif directory exists. If not, creates it
	async function ensureDirExists() {
		const dirInfo = await FileSystem.getInfoAsync(videoDir);
		if (!dirInfo.exists) {
			console.log("tmp directory doesn't exist, creating...");
			await FileSystem.makeDirectoryAsync(videoDir, { intermediates: true });
		}
	}

	await ensureDirExists();

	return `${videoDir}`;
}

export async function processVideo (mediaId, mediaUri, fps, compression, height, duration) {

	const path = await getResultPath();
	const command =
		`-i ${mediaUri} ` +
		`-c:v libx264 ` +
		`-vf scale=-1:${String(height)} ` +
		`-r ${fps} ` +
		`-crf ${compression} ` +
		String(duration ? `-t ${duration ? duration : 10} ` : "") +
		`${path}${mediaId}.mp4 ` +
		`-y`;

	await FFmpegKit.execute(command);
	return `${path}${mediaId}.mp4`;

}

export async function generateScreenshot (mediaId, mediaUri) {

	const path = await getResultPath();
	const command =
		`-i ${mediaUri} ` +
		`-ss 00:00:00 -vf "thumbnail,scale=-1:800" -vframes 1 ${path}${mediaId}.jpg ` +
		`-y`;

	await FFmpegKit.execute(command);
	return `${path}${mediaId}.jpg`;

}




export async function processPhoto (mediaId, mediaUri, compression) {

	const path = await getResultPath();
	const command =
		`-i ${mediaUri} ` +
		`-q:v ${compression} ` +
		`${path}${mediaId}.jpg ` +
		`-y`;

	await FFmpegKit.execute(command);
	return `${path}${mediaId}.jpg`;

}