import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { actions as usersActions } from "./usersSlice.js";
import { actions as categoriesActions } from "./categoriesSlice.js";

const operationsAdapter = createEntityAdapter();

const initialState = operationsAdapter.getInitialState();

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    addOperations: operationsAdapter.addMany,
    addOperation: operationsAdapter.addOne,
    removeOperation: operationsAdapter.removeOne,
    removeOperations: operationsAdapter.removeMany,
    updateOperation: operationsAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(usersActions.removeUser, (state, action) => {
      const userId = action.payload;
      const restEntities = Object.values(state.entities).filter((entity) => entity.author !== userId);
      operationsAdapter.setAll(state, restEntities);
    })
    .addCase(categoriesActions.removeCategory, (state, action) => {
      const categoryId = action.payload.id;

      const operationsToRemove = Object.values(state.entities)
        .filter(operation => operation.categoryId === categoryId)
        .map(operation => operation.id);

      if (operationsToRemove.length > 0) {
        operationsAdapter.removeMany(state, operationsToRemove);
      }
    });
  }
});

export const { actions } = operationsSlice;
export const selectors = operationsAdapter.getSelectors(
  (state) => state.operations
);
export default operationsSlice.reducer;