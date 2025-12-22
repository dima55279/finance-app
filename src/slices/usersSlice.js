import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

const usersAdapter = createEntityAdapter();

const initialState = usersAdapter.getInitialState();

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
    }
  },
});

export const { actions } = usersSlice;
export const selectors = usersAdapter.getSelectors((state) => state.users);
export default usersSlice.reducer;