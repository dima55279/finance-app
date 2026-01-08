/*
Файл usersApi содержит функцию createApi для создания API для работы с пользователями, а также различные эндпоинты для запросов.
*/
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Функция для получения токена доступа из localStorage
const getToken = () => localStorage.getItem('access_token');

// Создание API для работы с пользователями
export const usersApi = createApi({
  reducerPath: "usersApi", // Уникальный ключ для редьюсера
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/user', // Базовый URL для всех запросов
    // Функция для подготовки заголовков запроса
    prepareHeaders: (headers, { getState }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`); // Добавление токена авторизации
      }
      headers.set('Content-Type', 'application/json'); // Установка типа контента
      return headers;
    }
  }),
  tagTypes: ['User', 'CurrentUser'], // Типы тегов для инвалидации кэша
  endpoints: (builder) => ({
    // Мутация для входа пользователя
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login', // Endpoint для входа
        method: 'POST',
        body: credentials, // Учетные данные (email и пароль)
      }),
      // Функция обработки ответа: сохранение токена в localStorage
      transformResponse: (response) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
        }
        return response;
      },
      invalidatesTags: ['CurrentUser'], // Инвалидация кэша текущего пользователя
    }),
    // Мутация для регистрации пользователя
    register: builder.mutation({
      query: (userData) => ({
        url: '/register', // Endpoint для регистрации
        method: 'POST',
        body: userData, // Данные нового пользователя
      }),
      // Функция обработки ответа: сохранение токена в localStorage
      transformResponse: (response) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
        }
        return response;
      },
      invalidatesTags: ['CurrentUser'],
    }),
    // Мутация для выхода пользователя
    logout: builder.mutation({
      query: () => ({
        url: '/logout', // Endpoint для выхода
        method: 'POST',
      }),
      // Функция обработки ответа: удаление токена из localStorage
      transformResponse: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        return { message: 'Logged out' };
      },
      invalidatesTags: ['CurrentUser'],
    }),
    // Запрос для получения данных текущего пользователя
    getCurrentUser: builder.query({
      query: () => '/me', // Endpoint для получения текущего пользователя
      providesTags: ['CurrentUser'], // Теги для кэширования
    }),
    
    // Запрос для получения всех пользователей
    getUsers: builder.query({
      query: () => '', // Пустой endpoint (использует базовый URL)
      providesTags: ['User'], // Теги для кэширования
    }),
    // Запрос для получения пользователя по ID
    getUserById: builder.query({
      query: (id) => `/${id}`, // Динамический endpoint с ID пользователя
      providesTags: ['User'],
    }),
    // Мутация для добавления нового пользователя
    addUser: builder.mutation({
      query: (userData) => ({
        url: '',
        method: 'POST',
        body: userData, // Данные нового пользователя
      }),
      invalidatesTags: ['User'], // Инвалидация кэша пользователей
    }),
    // Мутация для обновления пользователя
    updateUser: builder.mutation({
      query: ({ id, changes }) => ({
        url: `/${id}`, // Динамический endpoint с ID пользователя
        method: 'PUT',
        body: changes, // Обновленные данные пользователя
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    // Мутация для обновления лимита бюджета пользователя
    updateUserBudget: builder.mutation({
      query: ({ userId, budgetLimit }) => ({
        url: `/${userId}/budget`, // Endpoint для обновления бюджета
        method: 'PATCH',
        body: { budgetLimit }, // Новый лимит бюджета
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    // Мутация для обновления аватара пользователя
    updateUserAvatar: builder.mutation({
      query: ({ userId, avatar }) => ({
        url: `/${userId}/avatar`, // Endpoint для обновления аватара
        method: 'PATCH',
        body: { avatar }, // Новый аватар в формате base64
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    // Мутация для удаления пользователя
    removeUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`, // Динамический endpoint с ID пользователя
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Экспорт сгенерированных React хуков для использования в компонентах
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  
  useGetUsersQuery,
  useGetUserByIdQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useUpdateUserBudgetMutation,
  useUpdateUserAvatarMutation,
  useRemoveUserMutation,
} = usersApi;