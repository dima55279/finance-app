/*
Файл index содержит функцию configureStore, которая используется для создания и настройки Redux store.
*/
import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "./categoriesSlice.js";
import operationsReducer from "./operationsSlice.js";
import usersReducer from "./usersSlice.js";
import { usersApi } from "./api/usersApi.js";
import { categoriesApi } from "./api/categoriesApi.js";
import { operationsApi } from "./api/operationsApi.js";

// Создание и настройка Redux store
export default configureStore({
  reducer: {
    // Редьюсеры для отдельных частей состояния
    users: usersReducer,
    categories: categoriesReducer,
    operations: operationsReducer,
    // Редьюсеры для RTK Query API
    [usersApi.reducerPath]: usersApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [operationsApi.reducerPath]: operationsApi.reducer,
  },
  // Настройка middleware, добавление middleware для RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(categoriesApi.middleware)
      .concat(operationsApi.middleware),
});