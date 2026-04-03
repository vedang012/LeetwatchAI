function ReportSection({ title, content }) {
  const items = Array.isArray(content) ? content : content ? [content] : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item, index) => (
            <p key={`${title}-${index}`} className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-500">No insights returned.</p>
        )}
      </div>
    </div>
  )
}

function AIReport({ report, isLoading, isDisabled, error, onGenerate }) {
  return (
    <section className="card p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">AI Insights</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Generate a study report</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">One credit per session. Use it when you want a compact read on your recent LeetCode habits.</p>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isDisabled || isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isLoading ? 'Generating...' : isDisabled ? 'Credit Used' : 'Generate AI Report'}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <ReportSection title="Strengths" content={report.strengths} />
          <ReportSection title="Weaknesses" content={report.weaknesses} />
          <ReportSection title="Behavior" content={report.behavior} />
          <ReportSection title="Recommendations" content={report.recommendations} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500">
          Your AI report will appear here after generation.
        </div>
      )}
    </section>
  )
}

export default AIReport
