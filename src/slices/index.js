import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./categoriesSlice.js";
import operationsReducer from "./operationsSlice.js";
import usersReducer from "./usersSlice.js";
import { usersApi } from "./api/usersApi.js";
import { categoriesApi } from "./api/categoriesApi.js";
import { operationsApi } from "./api/operationsApi.js";

export default configureStore({
  reducer: {
    users: usersReducer,
    categories: categoriesReducer,
    operations: operationsReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(operationsApi.middleware),
});