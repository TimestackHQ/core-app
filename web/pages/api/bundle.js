export default function handler(req, res) {
	res.status(200).json({
		bundleVersion: "0.25.2",
		clientVersion: {
			ios: "0.25.2",
			android: "0.25.2"
		},
		backwardsCompatibleClients: {
			ios: [


			],
			android: [


			]
		},
		activeClients: {
			ios: [
				"0.25.2",
				"0.25.1"
			],
			android: [
				"0.25.2",
				"0.25.1"
			]
		}
	})
}