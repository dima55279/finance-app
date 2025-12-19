import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { actions as usersActions } from "./usersSlice.js";

const categoriesAdapter = createEntityAdapter();

const initialState = categoriesAdapter.getInitialState();

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategories: categoriesAdapter.addMany,
    addCategory: categoriesAdapter.addOne,
    updateCategory: categoriesAdapter.updateOne,
    removeCategory: (state, { payload }) =>
      categoriesAdapter.removeOne(state, payload.id),
  },
  extraReducers: (builder) => {
    builder.addCase(usersActions.removeUser, (state, action) => {
      const userId = action.payload;
      const restEntities = Object.values(state.entities).filter((entity) => entity.author !== userId);
      categoriesAdapter.setAll(state, restEntities);
    })
  }
});

export const { actions } = categoriesSlice;
export const selectors = categoriesAdapter.getSelectors((state) => state.categories);
export default categoriesSlice.reducer;