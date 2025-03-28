import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UseCourseState {
  selectedCourse: string | null;
}

const initialState: UseCourseState = {
  selectedCourse: null,
};

const useCourseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setSelectedCourse: (state, action: PayloadAction<string | null>) => {
      state.selectedCourse = action.payload;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
  },
});

export const { setSelectedCourse, clearSelectedCourse } =
  useCourseSlice.actions;
export default useCourseSlice.reducer;
