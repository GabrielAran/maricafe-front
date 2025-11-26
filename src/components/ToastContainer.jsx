import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toastDismissed } from '../redux/slices/toastSlice.js'
import Toast from './Toast.jsx'

/**
 * ToastContainer component that reads toasts from Redux and renders them
 * Replaces the old ToastProvider's toast rendering functionality
 */
export default function ToastContainer() {
  const toasts = useSelector((state) => state.toast.toasts)
  const dispatch = useDispatch()

  const handleClose = (id) => {
    dispatch(toastDismissed(id))
  }

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </>
  )
}

