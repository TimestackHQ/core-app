import { configureStore } from '@reduxjs/toolkit'
import rollState from './rollState';

const store = configureStore({
    reducer: {
        rollState: rollState
    }
})

export default store;


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch