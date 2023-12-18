import { configureStore } from '@reduxjs/toolkit'
import rollState from './rollState';
import userState from './userState';

const store = configureStore({
    reducer: {
        rollState: rollState,
        userState: userState
    }
})

export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch