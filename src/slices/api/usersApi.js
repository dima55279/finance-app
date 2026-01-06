import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => localStorage.getItem('access_token');

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/user',
    prepareHeaders: (headers, { getState }) => {
      const token = getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
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
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
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
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user_id', response.user_id);
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
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
      query: ({ id, changes }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: changes,
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    updateUserBudget: builder.mutation({
      query: ({ userId, budgetLimit }) => ({
        url: `/${userId}/budget`,
        method: 'PATCH',
        body: { budgetLimit },
      }),
      invalidatesTags: ['User', 'CurrentUser'],
    }),

    updateUserAvatar: builder.mutation({
      query: ({ userId, avatar }) => ({
        url: `/${userId}/avatar`,
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