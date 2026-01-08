/*
Файл usersSlice содержит редьюсеры и дополнительные редьюсеры для управления состоянием пользователей.
*/
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

// Создание адаптера сущностей для пользователей
const usersAdapter = createEntityAdapter();

// Инициализация начального состояния с дополнительными полями для аутентификации
const initialState = usersAdapter.getInitialState({
  currentUser: null, // Текущий авторизованный пользователь
  isAuthenticated: false, // Флаг аутентификации
  loading: false, // Флаг загрузки
  error: null, // Ошибка
});

// Создание слайса для управления состоянием пользователей
const usersSlice = createSlice({
  name: "users", // Имя слайса
  initialState, // Начальное состояние
  reducers: {
    // Редьюсер для добавления одного пользователя
    addUser: usersAdapter.addOne,
    // Редьюсер для добавления нескольких пользователей
    addUsers: usersAdapter.addMany,
    // Редьюсер для удаления пользователя по ID
    removeUser: usersAdapter.removeOne,
    // Редьюсер для обновления пользователя
    updateUser: usersAdapter.updateOne,
    // Редьюсер для обновления аватара пользователя
    updateUserAvatar: (state, action) => {
      const { userId, avatar } = action.payload;
      if (state.entities[userId]) {
        state.entities[userId].avatar = avatar;
      }
      if (state.currentUser && state.currentUser.id === userId) {
        state.currentUser.avatar = avatar;
      }
    },
    // Действие начала входа (устанавливает флаг загрузки и сбрасывает ошибку)
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Действие успешного входа (устанавливает текущего пользователя и флаг аутентификации)
    loginSuccess: (state, action) => {
      const userData = action.payload;
      state.currentUser = userData;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    // Действие неудачного входа (сбрасывает флаг загрузки и устанавливает ошибку)
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Действие выхода (сбрасывает текущего пользователя и флаг аутентификации)
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    // Действие начала регистрации (устанавливает флаг загрузки и сбрасывает ошибку)
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Действие успешной регистрации (устанавливает текущего пользователя и флаг аутентификации)
    registerSuccess: (state, action) => {
      const userData = action.payload;
      state.currentUser = userData;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    // Действие неудачной регистрации (сбрасывает флаг загрузки и устанавливает ошибку)
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Действие обновления текущего пользователя (слияние с новыми данными)
    updateCurrentUser: (state, action) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    // Действие установки текущего пользователя (например, после загрузки из localStorage)
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

// Экспорт действий слайса
export const { actions } = usersSlice;
// Экспорт селекторов для извлечения данных из состояния пользователей
export const selectors = usersAdapter.getSelectors((state) => state.users);
// Экспорт редьюсера по умолчанию
export default usersSlice.reducer;