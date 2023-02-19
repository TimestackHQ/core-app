const rootReducer = (oldState = {}, action) => {
	let state = oldState;

	const type = action.type;
	// app wrap
	if (type === "SET_USER") {
		state = {...state, user: action.payload};
	}
	else if (type === "SET_UPLOAD_QUEUE") {
		state = {...state, uploadQueue: action.payload};
	}

	return {...state};
};

export default rootReducer;