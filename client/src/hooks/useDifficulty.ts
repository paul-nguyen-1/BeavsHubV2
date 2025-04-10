import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UseDifficultyState {
  selectedDifficulty: string | null;
}

const initialState: UseDifficultyState = {
  selectedDifficulty: null,
};

const useDifficultySlice = createSlice({
  name: "difficulty",
  initialState,
  reducers: {
    setSelectedDifficulty: (state, action: PayloadAction<string | null>) => {
      state.selectedDifficulty = action.payload;
    },
    clearSelectedDifficulty: (state) => {
      state.selectedDifficulty = null;
    },
  },
});

export const { setSelectedDifficulty, clearSelectedDifficulty } =
  useDifficultySlice.actions;
export default useDifficultySlice.reducer;
