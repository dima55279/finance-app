import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: fetchBaseQuery({ 
      baseUrl: 'http://localhost:8000/category',
      credentials: 'include',
    }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => '',
            providesTags: ['Categories'],
        }),
        getCategoriesByUser: builder.query({
            query: (userId) => `?author=${userId}`,
            providesTags: ['Categories'],
        }),
        addCategory: builder.mutation({
            query: (categoryData) => ({
                url: '',
                method: 'POST',
                body: categoryData,
            }),
            invalidatesTags: ['Categories'],
        }),
        removeCategory: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoriesByUserQuery,
    useAddCategoryMutation,
    useRemoveCategoryMutation,
} = categoriesApi;