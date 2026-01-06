import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const usersAdapter = createEntityAdapter();

const initialState = usersAdapter.getInitialState({
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: usersAdapter.addOne,
    addUsers: usersAdapter.addMany,
    removeUser: usersAdapter.removeOne,
    updateUser: usersAdapter.updateOne,
    updateUserAvatar: (state, action) => {
      const { userId, avatar } = action.payload;
      if (state.entities[userId]) {
        state.entities[userId].avatar = avatar;
      }
      if (state.currentUser && state.currentUser.id === userId) {
        state.currentUser.avatar = avatar;
      }
    },
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
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { actions } = usersSlice;
export const selectors = usersAdapter.getSelectors((state) => state.users);
export default usersSlice.reducer;