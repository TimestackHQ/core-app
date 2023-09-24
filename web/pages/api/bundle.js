export default function handler(req, res) {
	res.status(200).json({
		bundleVersion: "0.23.2",
		clientVersion: {
			ios: "0.23.2",
			android: "0.23.2"
		},
		backwardsCompatibleClients: {
			ios: [

				"0.23.3",
				"0.23.2",

			],
			android: [

				"0.23.2",
				"0.23.3",

			]
		},
		activeClients: {
			ios: [
				"0.25.0",
				"0.24.0",
				"0.23.4",
				"0.23.5"
			],
			android: [
				"0.23.4",
				"0.23.5",
				"0.23.2"
			]
		}
	})
}