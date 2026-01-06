import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const operationsApi = createApi({
    reducerPath: "operationsApi",
    baseQuery: fetchBaseQuery({ 
        baseUrl: 'http://localhost:8000/operation',
        credentials: 'include',
    }),
    tagTypes: ['Operations'],
    endpoints: (builder) => ({
        getOperations: builder.query({
            query: () => '',
            providesTags: ['Operations'],
        }),
        getOperationsByUser: builder.query({
            query: (userId) => {
                const params = new URLSearchParams();
                if (userId) params.append('author', userId);
                return `?${params.toString()}`;
            },
            providesTags: ['Operations'],
        }),
        getOperationsWithFilters: builder.query({
            query: ({ userId, categoryId, startDate, endDate }) => {
                const params = new URLSearchParams();
                params.append('author', userId);
                if (categoryId) params.append('categoryId', categoryId);
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                return `?${params.toString()}`;
            },
            providesTags: ['Operations'],
        }),
        addOperation: builder.mutation({
            query: (operationData) => ({
                method: 'POST',
                body: operationData,
            }),
            invalidatesTags: ['Operations'],
        }),
        updateOperation: builder.mutation({
            query: ({ id, changes }) => ({
                url: `/${id}`,
                method: 'PATCH',
                body: changes,
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