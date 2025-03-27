import { configureStore } from "@reduxjs/toolkit";
import useCourseReducer from "../src/hooks/useCourse";

const store = configureStore({
  reducer: {
    useCourse: useCourseReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
