import { useEffect, useState } from 'react'
import AIReport from '../components/AIReport'
import Heatmap from '../components/Heatmap'
import ProfileCard from '../components/ProfileCard'
import RecentSubmissions from '../components/RecentSubmissions'
import TagStats from '../components/TagStats'
import {
  generateAiReport,
  getProfile,
  getRecentSubmissions,
  getSubmissionCalendar,
  getTagStats,
} from '../services/api'

function getNumber(value, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function toTitleCase(value) {
  return String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function unwrapMatchedUser(payload) {
  return payload?.data?.matchedUser || payload?.matchedUser || payload?.data || payload || {}
}

function normalizeProfile(rawProfile, username) {
  const source = unwrapMatchedUser(rawProfile)
  const profile = source.profile || {}
  const solvedStats = source.submitStatsGlobal?.acSubmissionNum || source.submitStats?.acSubmissionNum || []

  const findSolved = (difficulty) =>
    getNumber(solvedStats.find((item) => item.difficulty?.toLowerCase() === difficulty)?.count)

  const totalSolved =
    getNumber(solvedStats.find((item) => item.difficulty?.toLowerCase() === 'all')?.count) ||
    findSolved('easy') + findSolved('medium') + findSolved('hard')

  return {
    username: source.username || username,
    displayName: profile.realName || source.username || username,
    ranking: getNumber(profile.ranking) || 'N/A',
    totalSolved,
    easySolved: findSolved('easy'),
    mediumSolved: findSolved('medium'),
    hardSolved: findSolved('hard'),
  }
}

function parseCalendarMap(rawCalendar) {
  if (!rawCalendar) {
    return {}
  }

  if (typeof rawCalendar === 'string') {
    try {
      return JSON.parse(rawCalendar)
    } catch {
      return {}
    }
  }

  if (typeof rawCalendar === 'object') {
    return rawCalendar
  }

  return {}
}

function normalizeCalendar(rawCalendar) {
  const source = unwrapMatchedUser(rawCalendar)
  const calendarMap = parseCalendarMap(
    source.submissionCalendar ||
      source.calendar ||
      rawCalendar?.data?.submissionCalendar ||
      rawCalendar?.submissionCalendar ||
      rawCalendar?.calendar,
  )

  const timestamps = Object.keys(calendarMap)
    .map((key) => Number(String(key).trim()))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  const days = timestamps.slice(-70).map((timestamp) => {
    const date = new Date(timestamp * 1000)
    const count = getNumber(calendarMap[String(timestamp)] ?? calendarMap[` ${timestamp}`])

    return {
      date: date.toISOString(),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
    }
  })

  return {
    days,
    totalSubmissions: days.reduce((sum, day) => sum + day.count, 0),
    activeDays: days.filter((day) => day.count > 0).length,
  }
}

function normalizeTags(rawTagStats) {
  const source = unwrapMatchedUser(rawTagStats)
  const tagGroups = source.tagProblemCounts || rawTagStats?.data?.tagProblemCounts || {}
  const tags = Object.values(tagGroups).filter(Array.isArray).flat()

  const normalized = tags
    .map((tag) => ({
      name: toTitleCase(tag.tagName || tag.name || tag.slug),
      solved: getNumber(tag.problemsSolved || tag.solved || tag.count),
    }))
    .filter((tag) => tag.name)
    .sort((a, b) => b.solved - a.solved)

  const strongestTags = normalized.slice(0, 5)
  const weakestPool = normalized.filter((tag) => tag.solved > 0)
  const weakestTags = (weakestPool.length ? [...weakestPool] : [...normalized])
    .sort((a, b) => a.solved - b.solved)
    .slice(0, 5)

  return { allTags: normalized, strongestTags, weakestTags }
}

function normalizeSubmissions(rawSubmissions) {
  const items =
    rawSubmissions?.data?.recentSubmissionList ||
    rawSubmissions?.recentSubmissionList ||
    rawSubmissions?.recentSubmissions ||
    rawSubmissions?.submissions ||
    []

  if (!Array.isArray(items)) {
    return []
  }

  return items.slice(0, 8).map((submission, index) => {
    const epochSeconds =
      getNumber(submission.timestamp) ||
      getNumber(submission.submitTime) ||
      getNumber(submission.time)

    return {
      id: submission.id || `${submission.title || submission.titleSlug || 'submission'}-${index}`,
      title: submission.title || submission.problemName || toTitleCase(submission.titleSlug) || 'Untitled Problem',
      status: submission.statusDisplay || submission.status || submission.verdict || 'Unknown',
      language: submission.lang || submission.language || 'Unknown language',
      timestamp: epochSeconds ? new Date(epochSeconds * 1000).toLocaleString() : '',
    }
  })
}

function LoadingCard({ title }) {
  return (
    <section className="card p-6">
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60"
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">{title}</p>
    </section>
  )
}

const EMPTY_CALENDAR = { days: [], totalSubmissions: 0, activeDays: 0 }
const EMPTY_TAGS = { allTags: [], strongestTags: [], weakestTags: [] }

function Dashboard({ username, onLogout, theme, onToggleTheme }) {
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: '',
    profile: null,
    calendar: EMPTY_CALENDAR,
    tags: EMPTY_TAGS,
    submissions: [],
  })
  const [aiReport, setAiReport] = useState('')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [aiError, setAiError] = useState('')

  const fetchDashboardData = async () => {
    setDashboardState((current) => ({
      ...current,
      loading: true,
      error: '',
    }))

    const results = await Promise.allSettled([
      getProfile(username),
      getSubmissionCalendar(username),
      getTagStats(username),
      getRecentSubmissions(username),
    ])

    const [profileResult, calendarResult, tagResult, recentResult] = results
    const sectionErrors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason?.message)
      .filter(Boolean)

    const profile = profileResult.status === 'fulfilled' ? normalizeProfile(profileResult.value, username) : null
    const calendar = calendarResult.status === 'fulfilled' ? normalizeCalendar(calendarResult.value) : EMPTY_CALENDAR
    const tags = tagResult.status === 'fulfilled' ? normalizeTags(tagResult.value) : EMPTY_TAGS
    const submissions = recentResult.status === 'fulfilled' ? normalizeSubmissions(recentResult.value) : []

    const hasAnyData = Boolean(profile || calendar.days.length || tags.allTags.length || submissions.length)

    setDashboardState({
      loading: false,
      error: hasAnyData ? '' : sectionErrors[0] || 'Unable to load dashboard data right now.',
      profile,
      calendar,
      tags,
      submissions,
      sectionErrors,
    })
  }

  useEffect(() => {
    fetchDashboardData()
  }, [username])

  const handleGenerateReport = async () => {
    if (!username) {
      return
    }

    setIsGeneratingReport(true)
    setAiError('')

    try {
      const response = await generateAiReport(username)
      setAiReport(String(response || '').trim())
    } catch (error) {
      setAiError(error.message || 'Unable to generate the AI report right now.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const hasPartialWarning = dashboardState.sectionErrors?.length && !dashboardState.error

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(14,165,233,0.1),_transparent_20%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_54%,_#f5f8fc_100%)] px-4 py-6 text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#0f172a_55%,_#020617_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 card px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-accent-500 dark:text-accent-400">LeetWatch</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Welcome back, {username}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Your dashboard combines profile health, recent problem-solving activity, and a quick AI-generated study read.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onToggleTheme} className="theme-toggle">
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </button>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="rounded-xl border border-slate-300 bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Refresh Data
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-200"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {dashboardState.loading ? (
          <div className="grid gap-6">
            <LoadingCard title="Fetching profile and coding activity..." />
            <LoadingCard title="Preparing charts and study signals..." />
          </div>
        ) : dashboardState.error ? (
          <section className="card p-8">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-700 dark:text-rose-100">
              <h2 className="text-lg font-semibold">Dashboard unavailable</h2>
              <p className="mt-2 text-sm text-rose-700/90 dark:text-rose-200">{dashboardState.error}</p>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="mt-5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-400"
              >
                Retry
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-6">
            {hasPartialWarning ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-100">
                Some sections could not be loaded, but available data is still shown below.
              </div>
            ) : null}

            {dashboardState.profile ? <ProfileCard profile={dashboardState.profile} /> : null}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Heatmap days={dashboardState.calendar.days} />
              <TagStats
                strongestTags={dashboardState.tags.strongestTags}
                weakestTags={dashboardState.tags.weakestTags}
              />
            </div>

            <AIReport
              report={aiReport}
              isLoading={isGeneratingReport}
              isDisabled={!username}
              error={aiError}
              onGenerate={handleGenerateReport}
            />

            <RecentSubmissions submissions={dashboardState.submissions} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
