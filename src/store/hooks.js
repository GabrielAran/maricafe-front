import { useDispatch, useSelector } from 'react-redux'

// Typed hooks for Redux (will be useful if you migrate to TypeScript)
// For now, these are just convenience wrappers

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

