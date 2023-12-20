import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { RollType } from '../types/global'

const initialState: RollType = {
    holderType: "none",
}

export const counterSlice = createSlice<RollType, SliceCaseReducers<RollType>, "Roll">({
    name: 'Roll',
    initialState,
    reducers: {
        setRoll: (state: RollType, action: {
            type: "setRoll",
            payload: RollType
        }) => {
            state.holderType = action.payload.holderType;
            if (state.holderType === "event" || state.holderType === "socialProfile") {
                // @ts-ignore
                state.holderId = action.payload.holderId;
                if (state.holderType === "socialProfile") {
                    // @ts-ignore
                    state.profile = action.payload.profile;
                }
                // @ts-ignore
                state.holderImageUrl = action.payload.holderImageUrl;
                // @ts-ignore
                state.holderImageS3Object = action.payload.holderImageS3Object;
                console.log("setRoll", state)
            } else {
                if ("holderId" in state) delete state.holderId;
                if ("holderImageUrl" in state) delete state.holderImageUrl;
                if ("holderImageS3Object" in state) delete state.holderImageS3Object;
                if ("profile" in state) delete state.profile;
            }
        }
    }
})

export const { setRoll } = counterSlice.actions

export const selectRollState = (state: RootState) => state.rollState

export default counterSlice.reducer