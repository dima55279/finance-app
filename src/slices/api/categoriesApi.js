import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => localStorage.getItem('access_token');

export const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: fetchBaseQuery({ 
      baseUrl: 'http://localhost:8000/category',
      prepareHeaders: (headers) => {
        const token = getToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');
        return headers;
      },
    }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => '',
            providesTags: ['Categories'],
        }),
        getCategoriesByUser: builder.query({
            query: () => '',
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