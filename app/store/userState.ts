import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import type { RootState } from '.'
import {RollType, UserStoreType} from '../types/global'
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState: UserStoreType = {
    loggedIn: true,
    user: null
}

export const userSlice = createSlice<typeof initialState, SliceCaseReducers<typeof initialState>, "UserStore">({
    name: 'UserStore',
    initialState,
    reducers: {
        setAuthToken: (state: UserStoreType, action: {
            type: "setAuth",
            payload: string
        }): typeof initialState => {
            AsyncStorage.setItem('@session', action.payload)
            return {
                loggedIn: true,
                user: {
                    ...state.user,
                    authToken: action.payload
                }
            };
        }
    }
})

export const { setAuthToken } = userSlice.actions

export const selectUserState = (state: RootState) => state.userState

export default userSlice.reducer