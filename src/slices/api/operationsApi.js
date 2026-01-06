import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => localStorage.getItem('access_token');

export const operationsApi = createApi({
    reducerPath: "operationsApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8000/operation',
        prepareHeaders: (headers) => {
          const token = getToken();
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          headers.set('Content-Type', 'application/json');
          return headers;
        },
    }),
    tagTypes: ['Operations'],
    endpoints: (builder) => ({
        getOperations: builder.query({
            query: () => '',
            providesTags: ['Operations'],
        }),
        getOperationsByUser: builder.query({
            query: () => '',
            providesTags: ['Operations'],
        }),
        getOperationsWithFilters: builder.query({
            query: ({ categoryId, startDate, endDate }) => {
                const params = new URLSearchParams();
                if (categoryId) params.append('categoryId', categoryId);
                if (startDate) params.append('start_date', startDate);
                if (endDate) params.append('end_date', endDate);
                const queryString = params.toString();
                return queryString ? `?${queryString}` : '';
            },
            providesTags: ['Operations'],
        }),
        addOperation: builder.mutation({
            query: (operationData) => ({
                url: '',
                method: 'POST',
                body: operationData,
            }),
            invalidatesTags: ['Operations'],
        }),
        updateOperation: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Operations'],
        }),
        removeOperation: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Operations'],
        }),
    }),
});

export const {
    useGetOperationsQuery,
    useGetOperationsByUserQuery,
    useGetOperationsWithFiltersQuery,
    useAddOperationMutation,
    useUpdateOperationMutation,
    useRemoveOperationMutation,
} = operationsApi;