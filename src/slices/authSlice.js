import { createSlice } from "@reduxjs/toolkit";
import { actions as usersActions } from "./usersSlice.js";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const userData = action.payload;
      state.currentUser = userData;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      const userData = action.payload;
      state.currentUser = userData;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCurrentUser: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    updateBudget: (state, action) => {
      if (state.currentUser) {
        state.currentUser.budgetLimit = action.payload;
      }
    },

    updateAvatar: (state, action) => {
      if (state.currentUser) {
        state.currentUser.avatar = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(usersActions.updateUser, (state, action) => {
      const { id, changes } = action.payload;
      if (state.currentUser && state.currentUser.id === id) {
        state.currentUser = { ...state.currentUser, ...changes };
      }
    });
  }
});

export const { actions } = authSlice;
export default authSlice.reducer;