import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getLoginRemainingTime } from '../utils/cartPersistence.js'

/**
 * Debug component to show cart timer status
 * This component helps visualize the new activity-based timer behavior
 */
export default function CartTimerDebug() {
  const { isAuthenticated, user, token } = useAuth()
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'USER' || !token) {
      setRemainingTime(0)
      return
    }

    const updateStatus = () => {
      const time = getLoginRemainingTime(token)
      setRemainingTime(time)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.role, token])

  if (!isAuthenticated || user?.role !== 'USER') {
    return null
  }

  const formatTime = (minutes) => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg text-sm max-w-xs">
      <h3 className="font-semibold mb-2">Cart Timer Debug</h3>
      <div className="space-y-1">
        <div>
          <span className="font-medium">Remaining:</span> {formatTime(remainingTime)}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          15 minutes from login - no activity refresh
        </div>
      </div>
    </div>
  )
}
