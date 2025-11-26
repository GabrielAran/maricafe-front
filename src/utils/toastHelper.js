/**
 * Toast notification helper functions
 * These functions dispatch toast actions to Redux store
 */

import { toastEnqueued } from '../redux/slices/toastSlice.js'

/**
 * Shows a success toast notification
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} message - Toast message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showSuccess = (dispatch, message, duration = 3000) => {
  const id = Date.now() + Math.random()
  dispatch(toastEnqueued({ id, message, type: 'success', duration }))
}

/**
 * Shows an error toast notification
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} message - Toast message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showError = (dispatch, message, duration = 3000) => {
  const id = Date.now() + Math.random()
  dispatch(toastEnqueued({ id, message, type: 'error', duration }))
}

/**
 * Shows a warning toast notification
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} message - Toast message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export const showWarning = (dispatch, message, duration = 3000) => {
  const id = Date.now() + Math.random()
  dispatch(toastEnqueued({ id, message, type: 'warning', duration }))
}

