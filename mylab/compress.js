const Ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const compress = () =>{
	// Ffmpeg("./input.mov")
	// 	.videoCodec('mpeg4')
	// 	.fps(20)
	// 	.videoBitrate(500)
	// 	.duration(10)
	// 	.outputOptions([
	// 		"-crf",
	// 		"23",
	// 	])
	// 	.output("./output.mp4")
	// 	.on('end', async function() {
	//
	//
	// 	}).run();

	Ffmpeg("./input.jpeg")
		.outputOptions([
			"-q:v",
			"100",
		])
		.size('?x1200')
		.output("./output.jpg")
		.on('end', async function() {


		}).run();
}

compress();