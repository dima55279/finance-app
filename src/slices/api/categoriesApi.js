/*
Файл categoriesApi.js содержит функцию createApi для создания API для работы с категориями, а также различные эндпоинты для запросов.
*/
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Функция для получения токена доступа из localStorage
const getToken = () => localStorage.getItem('access_token');

// Создание API для работы с категориями
export const categoriesApi = createApi({
    reducerPath: "categoriesApi", // Уникальный ключ для редьюсера
    baseQuery: fetchBaseQuery({ 
      baseUrl: 'http://localhost:8000/category', // Базовый URL для всех запросов
      // Функция для подготовки заголовков запроса
      prepareHeaders: (headers) => {
        const token = getToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`); // Добавление токена авторизации
        }
        headers.set('Content-Type', 'application/json'); // Установка типа контента
        return headers;
      },
    }),
    tagTypes: ['Categories'], // Типы тегов для инвалидации кэша
    endpoints: (builder) => ({
        // Запрос для получения всех категорий
        getCategories: builder.query({
            query: () => '', // Пустой endpoint (использует базовый URL)
            providesTags: ['Categories'], // Теги для кэширования
        }),
        // Запрос для получения категорий текущего пользователя
        getCategoriesByUser: builder.query({
            query: () => '',
            providesTags: ['Categories'],
        }),
        // Мутация для добавления новой категории
        addCategory: builder.mutation({
            query: (categoryData) => ({
                url: '',
                method: 'POST',
                body: categoryData, // Данные новой категории
            }),
            invalidatesTags: ['Categories'], // Инвалидация кэша категорий
        }),
        // Мутация для удаления категории
        removeCategory: builder.mutation({
            query: (id) => ({
                url: `/${id}`, // Динамический endpoint с ID категории
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

// Экспорт сгенерированных React хуков для использования в компонентах
export const {
    useGetCategoriesQuery,
    useGetCategoriesByUserQuery,
    useAddCategoryMutation,
    useRemoveCategoryMutation,
} = categoriesApi;