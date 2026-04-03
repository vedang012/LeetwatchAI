function TagList({ title, tags, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{title}</h3>
        <div className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      </div>

      <div className="mt-4 space-y-3">
        {tags.length ? (
          tags.map((tag, index) => (
            <div key={`${tag.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-900/60">
              <span className="text-sm text-slate-800 dark:text-slate-200">{tag.name}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{tag.solved}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-500">No tag data available.</p>
        )}
      </div>
    </div>
  )
}

function TagStats({ strongestTags, weakestTags }) {
  return (
    <section className="card p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">Tag Analysis</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">Strengths and practice gaps</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">A quick read on where you perform well and where more repetition could help.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TagList title="Top Tags Solved" tags={strongestTags} tone="bg-emerald-400" />
        <TagList title="Weakest Tags" tags={weakestTags} tone="bg-amber-400" />
      </div>
    </section>
  )
}

export default TagStats
