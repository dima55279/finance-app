import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/user',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      return headers;
    }
  }),
  tagTypes: ['User', 'CurrentUser'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        if (response.session_id) {
          localStorage.setItem('session_id', response.session_id);
          document.cookie = `session_id=${response.session_id}; path=/`;
        }
        return response;
      },
      invalidatesTags: ['CurrentUser'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => {
        if (response.session_id) {
          localStorage.setItem('session_id', response.session_id);
          document.cookie = `session_id=${response.session_id}; path=/`;
        }
        return response;
      },
      invalidatesTags: ['CurrentUser'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      transformResponse: () => {
        localStorage.removeItem('session_id');
        document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return { message: 'Logged out' };
      },
      invalidatesTags: ['CurrentUser'],
    }),
    getCurrentUser: builder.query({
      query: () => '/me',
      providesTags: ['CurrentUser'],
    }),
    
    getUsers: builder.query({
      query: () => '',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['User'],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: '',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, changes }) => {
        if (changes.budgetLimit !== undefined) {
          return {
            url: `?user_id=${id}`,
            method: 'PATCH',
            body: { budgetLimit: changes.budgetLimit },
          };
        }
        else if (changes.avatar !== undefined) {
          return {
            url: `/avatar?user_id=${id}`,
            method: 'PATCH',
            body: { avatar: changes.avatar },
          };
        }
        return {
          url: `/${id}`,
          method: 'PATCH',
          body: changes,
        };
      },
      invalidatesTags: ['User', 'CurrentUser'],
    }),
    updateUserBudget: builder.mutation({
      query: ({ userId, budgetLimit }) => ({
        url: `?user_id=${userId}`,
        method: 'PATCH',
        body: { budgetLimit },
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    updateUserAvatar: builder.mutation({
      query: ({ userId, avatar }) => ({
        url: `/avatar?user_id=${userId}`,
        method: 'PATCH',
        body: { avatar },
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    removeUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

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