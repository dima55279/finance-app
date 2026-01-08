/*
Файл categoriesSlice содержит редьюсеры и дополнительные редьюсеры для управления состоянием категорий.
*/
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { actions as usersActions } from "./usersSlice.js";

// Создание адаптера сущностей для категорий для нормализованного состояния
const categoriesAdapter = createEntityAdapter();

// Инициализация начального состояния с помощью адаптера
const initialState = categoriesAdapter.getInitialState();

// Создание слайса для управления состоянием категорий
const categoriesSlice = createSlice({
  name: "categories", // Имя слайса
  initialState, // Начальное состояние
  reducers: {
    // Редьюсер для добавления нескольких категорий
    addCategories: categoriesAdapter.addMany,
    // Редьюсер для добавления одной категории
    addCategory: categoriesAdapter.addOne,
    // Редьюсер для обновления одной категории
    updateCategory: categoriesAdapter.updateOne,
    // Редьюсер для удаления категории по ID (payload должен содержать id)
    removeCategory: (state, { payload }) =>
      categoriesAdapter.removeOne(state, payload.id),
  },
  // Дополнительные редьюсеры для обработки действий из других слайсов
  extraReducers: (builder) => {
    // Обработка удаления пользователя: удаление категорий, связанных с удаленным пользователем
    builder.addCase(usersActions.removeUser, (state, action) => {
      const userId = action.payload;
      const restEntities = Object.values(state.entities).filter((entity) => entity.author !== userId);
      categoriesAdapter.setAll(state, restEntities);
    })
  }
});

// Экспорт действий слайса
export const { actions } = categoriesSlice;
// Экспорт селекторов для извлечения данных из состояния
export const selectors = categoriesAdapter.getSelectors((state) => state.categories);
// Экспорт редьюсера по умолчанию
export default categoriesSlice.reducer;