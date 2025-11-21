import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:4002'

const getAuthHeaders = (state) => {
    const token = state.user.token
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
}

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (credentials) => {
        const response = await axios.post(`${API_BASE_URL}/maricafe/auth/login`, credentials)
        return response.data
    }
)

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (userData) => {
        const response = await axios.post(`${API_BASE_URL}/maricafe/auth/register`, userData)
        return response.data
    }
)

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ userId, data }, { getState }) => {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}`, data, {
            headers: getAuthHeaders(getState())
        })

        return response.data
    }
)

export const changePassword = createAsyncThunk(
    'user/changePassword',
    async ({ userId, data }, { getState }) => {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}/change-password`, data, {
            headers: getAuthHeaders(getState())
        })

        return response.data
    }
)

const initialState = {
    currentUser: null,
    token: null,
    pending: false,
    error: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null
            state.token = null
            state.error = null
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.pending = false
                state.token = action.payload.access_token
                state.currentUser = action.payload.user
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })

        builder
            .addCase(registerUser.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.pending = false
                state.token = action.payload.access_token
                state.currentUser = action.payload.user
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })

        builder
            .addCase(updateUser.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.pending = false
                const backendUser = action.payload.data

                // Map snake_case to camelCase
                const mappedUser = {
                    userId: backendUser.user_id,
                    firstName: backendUser.first_name,
                    lastName: backendUser.last_name,
                    email: backendUser.email,
                    role: backendUser.role
                }

                if (state.currentUser && state.currentUser.userId === mappedUser.userId) {
                    state.currentUser = mappedUser
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })

        builder
            .addCase(changePassword.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.pending = false
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })
    }
})

export const { logout } = userSlice.actions
export default userSlice.reducer
