import { createSlice } from "@reduxjs/toolkit";
import { AuthStateType } from "./auth.types";

const initialState: AuthStateType = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: true,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {},
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
