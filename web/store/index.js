import {applyMiddleware, createStore} from "redux";
import {composeWithDevTools} from "redux-devtools-extension/index";
import thunk from 'redux-thunk';

import rootReducer from './reducer';
import {userInitRoutine} from "../utils/auth";

const initialState = {
	user: userInitRoutine(),
	uploadQueue: []
}

let store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunk)));

export default store;