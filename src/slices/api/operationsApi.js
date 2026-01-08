/*
Файл operationsApi.js содержит функцию createApi для создания API для работы с операциями, а также различные эндпоинты для запросов.
*/
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Функция для получения токена доступа из localStorage
const getToken = () => localStorage.getItem('access_token');

// Создание API для работы с операциями
export const operationsApi = createApi({
    reducerPath: "operationsApi", // Уникальный ключ для редьюсера
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8000/operation', // Базовый URL для всех запросов
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
    tagTypes: ['Operations'], // Типы тегов для инвалидации кэша
    endpoints: (builder) => ({
        // Запрос для получения всех операций
        getOperations: builder.query({
            query: () => '', // Пустой endpoint (использует базовый URL)
            providesTags: ['Operations'], // Теги для кэширования
        }),
        // Запрос для получения операций текущего пользователя
        getOperationsByUser: builder.query({
            query: () => '',
            providesTags: ['Operations'],
        }),
        // Запрос для получения операций с фильтрами
        getOperationsWithFilters: builder.query({
            query: ({ categoryId, startDate, endDate }) => {
                const params = new URLSearchParams(); // Создание параметров запроса
                if (categoryId) params.append('categoryId', categoryId);
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                const queryString = params.toString();
                return queryString ? `?${queryString}` : ''; // Формирование query string
            },
            providesTags: ['Operations'],
        }),
        // Мутация для добавления новой операции
        addOperation: builder.mutation({
            query: (operationData) => ({
                url: '',
                method: 'POST',
                body: operationData, // Данные новой операции
            }),
            invalidatesTags: ['Operations'], // Инвалидация кэша операций
        }),
        // Мутация для обновления операции
        updateOperation: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/${id}`, // Динамический endpoint с ID операции
                method: 'PUT',
                body: updates, // Обновленные данные операции
            }),
            invalidatesTags: ['Operations'],
        }),
        // Мутация для удаления операции
        removeOperation: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Operations'],
        }),
    }),
});

// Экспорт сгенерированных React хуков для использования в компонентах
export const {
    useGetOperationsQuery,
    useGetOperationsByUserQuery,
    useGetOperationsWithFiltersQuery,
    useAddOperationMutation,
    useUpdateOperationMutation,
    useRemoveOperationMutation,
} = operationsApi;