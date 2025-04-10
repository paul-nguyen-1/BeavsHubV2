import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UseHoursState {
  selectedHours: string | null;
}

const initialState: UseHoursState = {
  selectedHours: null,
};

const useHoursSlice = createSlice({
  name: "Hours",
  initialState,
  reducers: {
    setSelectedHours: (state, action: PayloadAction<string | null>) => {
      state.selectedHours = action.payload;
    },
    clearSelectedHours: (state) => {
      state.selectedHours = null;
    },
  },
});

export const { setSelectedHours, clearSelectedHours } = useHoursSlice.actions;
export default useHoursSlice.reducer;
