import { createContext, useContext, useMemo, useCallback, useState } from 'react'
import APP_CONFIG from '../config/constants'
import usersData from '../data/config/users.json'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Unable to parse stored auth user', error)
    return null
  }
}

function delay(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())

  const signIn = useCallback(async (email, password) => {
    await delay()
    if (!email || !password) {
      return { success: false, error: 'Enter your email and password to continue.' }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const match = usersData.find((record) => record.email.toLowerCase() === normalizedEmail)

    if (!match || match.password !== password) {
      return { success: false, error: 'Invalid email or password. Try again.' }
    }

    const authUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role
    }

    localStorage.setItem(APP_CONFIG.AUTH_STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
    return { success: true, user: authUser }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(APP_CONFIG.AUTH_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    signIn,
    signOut
  }), [user, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

