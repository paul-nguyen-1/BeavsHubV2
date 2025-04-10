import { configureStore } from "@reduxjs/toolkit";
import useCourseReducer from "../src/hooks/useCourse";
import useDifficultyReducer from "../src/hooks/useDifficulty";
import useHoursReducer from "../src/hooks/useHours";

const store = configureStore({
  reducer: {
    useCourse: useCourseReducer,
    useDifficulty: useDifficultyReducer,
    useHours: useHoursReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
