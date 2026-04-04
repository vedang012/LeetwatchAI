import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile } from '../services/api'

function Login({ onLogin, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
      setError('Enter a LeetCode username to continue.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await getProfile(trimmedUsername)
      onLogin(trimmedUsername)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'We could not verify that username.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_54%,_#f5f8fc_100%)] px-6 py-16 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#020617_100%)] dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.26),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_30%)]" />

      <div className="absolute right-6 top-6 z-20">
        <button type="button" onClick={onToggleTheme} className="theme-toggle">
          <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
        </button>
      </div>

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card flex flex-col justify-between p-8 lg:p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-accent-500 dark:text-accent-400">LeetWatch</p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Track your LeetCode momentum with a cleaner daily view.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Verify a username, pull in recent progress, and turn activity into a simple study dashboard with one-click AI insights.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Profile Snapshot', 'Solved counts, ranking, and difficulty breakdown.'],
              ['Activity Map', 'See how consistent your submissions have been over time.'],
              ['AI Summary', 'Generate a short report on patterns and next steps.'],
            ].map(([title, description]) => (
              <div key={title} className="panel p-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-500">Mock Authentication</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">Verify your LeetCode username</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            We'll validate the username by calling your profile endpoint and then take you straight to the dashboard.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                LeetCode Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="off"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. leetmaster99"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-accent-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {isLoading ? 'Verifying...' : 'Verify Username'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Login
