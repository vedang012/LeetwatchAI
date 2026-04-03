function getStatusStyles(status) {
  const normalized = status.toLowerCase()

  if (normalized.includes('accepted')) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
  }

  if (normalized.includes('wrong')) {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
  }

  return 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
}

function RecentSubmissions({ submissions }) {
  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">Recent Activity</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Latest submissions</h2>
        </div>
        <span className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {submissions.length} entries
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {submissions.length ? (
          submissions.map((submission, index) => (
            <div
              key={`${submission.title}-${submission.timestamp}-${index}`}
              className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">{submission.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {submission.language}
                    {submission.timestamp ? ` · ${submission.timestamp}` : ''}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles(submission.status)}`}>
                  {submission.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-500">No recent submissions were returned.</p>
        )}
      </div>
    </section>
  )
}

export default RecentSubmissions
