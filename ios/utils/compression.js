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

export async function processVideo(mediaId, mediaUri, fps, compression, height, duration) {
	const path = await getResultPath();
	const command = `-i ${mediaUri} ` +
	  `-c:v libx264 ` + // Use a more efficient codec
	  `-vf scale=-2:${height} ` + // Resize input video to the desired height
	  `-crf ${compression} ` +
	  `${duration ? `-t ${duration} ` : ""}` +
	  `${path}${mediaId}.mp4 ` +
	  `-y`;
  
	try {
	  await new Promise((resolve) => {
		FFmpegKit.execute(command)
		  .then((result) => {
			resolve(result);
		  })
		  .catch((err) => {
			// throw err;
		  });
	  });
	} catch (err) {
	  console.log(err);
	}
  
	return `${path}${mediaId}.mp4`;
  }
  

export async function generateScreenshot (mediaId, mediaUri) {

	const path = await getResultPath();
	const command =
		`-i ${mediaUri} ` +
		`-err_detect careful ` +
		`-ss 00:00:00 -vf "thumbnail,scale=-1:500" -vframes 1 ${path}${mediaId}.jpg ` +
		`-y`;

	try {
		await new Promise((resolve) => {
			FFmpegKit.execute(command)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					// throw err;
				});
		});
	} catch (err) {
		console.log(err);
	}
	return `${path}${mediaId}.jpg`;

}




export async function processPhoto (mediaId, mediaUri, compression, thumbnail) {

	console.log("sl;dfk;kfsd;lfds mediaUri", mediaUri)

	const path = await getResultPath();
	let command;
	if(thumbnail) {
		command = `-i ${mediaUri} ` +
			`-err_detect careful ` +
			`-vf "scale='if(gt(iw,ih),min(ih,800),-1)':'if(gt(iw,ih),-1,min(iw,800))',unsharp=5:3:0.8:5:3:0.8" -compression_level 80 -quality 80 `+
			`-q:v ${compression} ` +
			`${path}${mediaId}.jpg ` +
			`-y`;
	} else {
		command = `-i ${mediaUri} ` +
		`-err_detect careful ` +
		`-vf scale='min(2048\\, iw):-2' `+
		`-q:v ${compression} ` +
		`${path}${mediaId}.jpg ` +
		`-y`;
	}


	try {
		await new Promise((resolve) => {
			FFmpegKit.execute(command)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					// throw err;
				});
		});
	} catch (err) {
		console.log(err);
	}
	return `${path}${mediaId}.jpg`;

}