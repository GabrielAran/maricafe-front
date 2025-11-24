import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../api/axiosInstance'

export const buildAuthHeaders = (state, includeJson = false) => {
    const token = state.user.token
    const headers = {}

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    if (includeJson) {
        headers['Content-Type'] = 'application/json'
    }

    return headers
}

export const loginUser = createAsyncThunk(
    'user/loginUser',
    async (credentials) => {
        const response = await api.post('/maricafe/auth/login', credentials)
        return response.data
    }
)

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async (userData) => {
        const response = await api.post('/maricafe/auth/register', userData)
        return response.data
    }
)

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ userId, data }, { getState }) => {
        const response = await api.put(`/users/${userId}`, data, {
            headers: buildAuthHeaders(getState(), true)
        })

        return response.data
    }
)

export const changePassword = createAsyncThunk(
    'user/changePassword',
    async ({ userId, data }, { getState }) => {
        const response = await api.put(`/users/${userId}/change-password`, data, {
            headers: buildAuthHeaders(getState(), true)
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
