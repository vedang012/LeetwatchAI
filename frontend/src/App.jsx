import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const STORAGE_KEY = 'leetwatch.username'
const THEME_STORAGE_KEY = 'leetwatch.theme'

function App() {
  const [username, setUsername] = useState('')
  const [theme, setTheme] = useState('light')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY)
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (savedUsername) {
      setUsername(savedUsername)
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
    }

    setIsReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleLogin = (nextUsername) => {
    localStorage.setItem(STORAGE_KEY, nextUsername)
    setUsername(nextUsername)
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUsername('')
  }

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <div className="card w-full max-w-md p-6 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-accent-500 dark:border-slate-700" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Preparing your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          username ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} theme={theme} onToggleTheme={handleThemeToggle} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          username ? (
            <Dashboard
              username={username}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={handleThemeToggle}
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={username ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
