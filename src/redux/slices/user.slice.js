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

// GET /users - Get all users (admin only)
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAllUsers',
    async (_, { getState }) => {
        const response = await api.get('/users', {
            headers: buildAuthHeaders(getState())
        })
        return response.data
    }
)

// GET /users/{userId} - Get user by ID
export const fetchUserById = createAsyncThunk(
    'user/fetchUserById',
    async (userId, { getState }) => {
        const response = await api.get(`/users/${userId}`, {
            headers: buildAuthHeaders(getState())
        })
        return response.data
    }
)

// DELETE /users/{userId} - Delete user (admin only)
export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (userId, { getState }) => {
        const response = await api.delete(`/users/${userId}`, {
            headers: buildAuthHeaders(getState())
        })
        return { userId, data: response.data }
    }
)

const initialState = {
    currentUser: null,
    token: null,
    users: [],
    selectedUser: null,
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
                // Map snake_case backend format to camelCase
                const backendUser = action.payload.user
                state.currentUser = {
                    userId: backendUser.user_id,
                    firstName: backendUser.first_name,
                    lastName: backendUser.last_name,
                    email: backendUser.email,
                    role: backendUser.role
                }
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
                // Map snake_case backend format to camelCase
                const backendUser = action.payload.user
                state.currentUser = {
                    userId: backendUser.user_id,
                    firstName: backendUser.first_name,
                    lastName: backendUser.last_name,
                    email: backendUser.email,
                    role: backendUser.role
                }
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

        // Fetch all users
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.pending = false
                const users = Array.isArray(action.payload) ? action.payload : []
                // Map snake_case to camelCase
                state.users = users.map(user => ({
                    userId: user.user_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                }))
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })

        // Fetch user by ID
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.pending = false
                const backendUser = action.payload
                if (backendUser) {
                    // Map snake_case to camelCase
                    const mappedUser = {
                        userId: backendUser.user_id,
                        firstName: backendUser.first_name,
                        lastName: backendUser.last_name,
                        email: backendUser.email,
                        role: backendUser.role
                    }
                    state.selectedUser = mappedUser
                    // Also update in users array if it exists
                    const index = state.users.findIndex(u => u.userId === mappedUser.userId)
                    if (index !== -1) {
                        state.users[index] = mappedUser
                    }
                }
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })

        // Delete user
        builder
            .addCase(deleteUser.pending, (state) => {
                state.pending = true
                state.error = null
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.pending = false
                const userId = action.payload.userId
                state.users = state.users.filter(u => u.userId !== userId)
                if (state.selectedUser && state.selectedUser.userId === userId) {
                    state.selectedUser = null
                }
                if (state.currentUser && state.currentUser.userId === userId) {
                    state.currentUser = null
                    state.token = null
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.pending = false
                state.error = action.error.message
            })
    }
})

export const { logout } = userSlice.actions

// Selectors for easy access to auth state
export const selectCurrentUser = (state) => state.user.currentUser
export const selectToken = (state) => state.user.token
export const selectIsAuthenticated = (state) => !!state.user.currentUser && !!state.user.token
export const selectIsAdmin = (state) => state.user.currentUser?.role === 'ADMIN'
export const selectUserPending = (state) => state.user.pending
export const selectUserError = (state) => state.user.error

export default userSlice.reducer
