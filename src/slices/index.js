import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./categoriesSlice.js";
import operationsReducer from "./operationsSlice.js";
import usersReducer from "./usersSlice.js";
import authReducer from "./authSlice.js";

export default configureStore({
  reducer: {
    users: usersReducer,
    categories: categoriesReducer,
    operations: operationsReducer,
    auth: authReducer,
  },
});