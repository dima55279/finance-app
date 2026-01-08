/*
Файл operationsSlice содержит редьюсеры и дополнительные редьюсеры для управления состоянием операций.
*/
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { actions as usersActions } from "./usersSlice.js";
import { actions as categoriesActions } from "./categoriesSlice.js";

// Создание адаптера сущностей для операций
const operationsAdapter = createEntityAdapter();

// Инициализация начального состояния
const initialState = operationsAdapter.getInitialState();

// Создание слайса для управления состоянием операций
const operationsSlice = createSlice({
  name: "operations", // Имя слайса
  initialState, // Начальное состояние
  reducers: {
    // Редьюсер для добавления нескольких операций
    addOperations: operationsAdapter.addMany,
    // Редьюсер для добавления одной операции
    addOperation: operationsAdapter.addOne,
    // Редьюсер для удаления одной операции
    removeOperation: operationsAdapter.removeOne,
    // Редьюсер для удаления нескольких операций
    removeOperations: operationsAdapter.removeMany,
    // Редьюсер для обновления одной операции
    updateOperation: operationsAdapter.updateOne,
  },
  // Дополнительные редьюсеры для обработки действий из других слайсов
  extraReducers: (builder) => {
    // Обработка удаления пользователя: удаление операций, связанных с удаленным пользователем
    builder.addCase(usersActions.removeUser, (state, action) => {
      const userId = action.payload;
      const restEntities = Object.values(state.entities).filter((entity) => entity.author !== userId);
      operationsAdapter.setAll(state, restEntities);
    })
    // Обработка удаления категории: удаление операций, связанных с удаленной категорией
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

// Экспорт действий слайса
export const { actions } = operationsSlice;
// Экспорт селекторов для извлечения данных из состояния операций
export const selectors = operationsAdapter.getSelectors(
  (state) => state.operations
);
// Экспорт редьюсера по умолчанию
export default operationsSlice.reducer;