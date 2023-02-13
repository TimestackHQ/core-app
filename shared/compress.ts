import * as fs from "fs";
import * as Ffmpeg from "fluent-ffmpeg";

export const compressVideo = async (fileId: string, fileBuffer: Buffer, compression: number, duration?: number) => {

	const inputFilePath = "/tmp/"+fileId+".tmp";
	const outputFilePath = "/tmp/"+fileId+".mp4";

    fs.writeFileSync(inputFilePath, <Buffer>fileBuffer);

	await new Promise((resolve) => {

		let video = Ffmpeg(inputFilePath)
			.videoCodec('libx264')
			.format('mp4')
			.fps(24)
			.outputOptions([
				"-crf",
				compression.toString(),
			])
			.output(outputFilePath)
			.on('end', function() {
				resolve(true);
			})
			.screenshot({
				timestamps: ['00:00.000'],
				filename: fileId+'.snapshot.jpg',
				folder: '/tmp/',
				size: '300x?'
			});

		if(duration) video = video.duration(duration).size("600x?");

		video.run();



	});

	console.log(fs.readFileSync("/tmp/"+fileId+".snapshot.jpg"))

	return outputFilePath;

};

export const compressImage = async (fileId: string, fileBuffer: Buffer, compression: number) => {

	const inputFilePath = "/tmp/"+fileId+".tmp";
	const outputFilePath = "/tmp/"+fileId+".jpg";

	fs.writeFileSync(inputFilePath, <Buffer>fileBuffer);

	await new Promise((resolve) => {

		let image = Ffmpeg(inputFilePath)
			.outputOptions([
				"-q:v",
				compression.toString()
			])
			.size('?x1200')
			.output(outputFilePath)
			.on('end', function() {
				resolve(true);
			});

		image.run();

	});

	return outputFilePath;

};
