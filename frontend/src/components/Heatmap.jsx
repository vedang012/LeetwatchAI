function getIntensityClass(count) {
  if (count <= 0) return 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
  if (count <= 2) return 'bg-blue-100 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
  if (count <= 4) return 'bg-blue-200 border-blue-300 dark:bg-blue-900/80 dark:border-blue-800'
  if (count <= 7) return 'bg-blue-400/80 border-blue-500 dark:bg-blue-700/80 dark:border-blue-600'
  return 'bg-accent-500/80 border-accent-500 dark:border-accent-400'
}

function Heatmap({ days }) {
  const visibleDays = days.length
    ? days
    : Array.from({ length: 70 }, (_, index) => ({ date: `day-${index}`, count: 0, label: 'No data' }))

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">Activity Heatmap</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Consistency over the last stretch</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
          <span>Less</span>
          {[0, 1, 3, 6, 9].map((count) => (
            <span
              key={count}
              className={`h-3 w-3 rounded-sm border ${getIntensityClass(count)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 sm:grid-cols-10 lg:grid-cols-14">
        {visibleDays.map((day) => (
          <div
            key={day.date}
            className={`group relative aspect-square rounded-md border ${getIntensityClass(day.count)}`}
            title={`${day.label}: ${day.count} submission${day.count === 1 ? '' : 's'}`}
          >
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              {day.label}: {day.count}
            </span>
          </div>
        ))}
      </div>

      {!days.length && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">No submission history was returned yet. The grid is ready when data arrives.</p>
      )}
    </section>
  )
}

export default Heatmap
