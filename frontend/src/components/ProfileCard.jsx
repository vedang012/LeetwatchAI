function Metric({ label, value, accentClass = 'text-slate-900 dark:text-slate-100' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  )
}

function ProfileCard({ profile }) {
  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent-500 dark:text-accent-400">Profile Summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{profile.displayName}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">A quick look at solved problems and ranking.</p>
        </div>
        <div className="rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-700 dark:border-accent-500/30 dark:text-accent-100">
          @{profile.username}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Solved" value={profile.totalSolved} accentClass="text-accent-700 dark:text-accent-100" />
        <Metric label="Easy" value={profile.easySolved} accentClass="text-emerald-600 dark:text-emerald-300" />
        <Metric label="Medium" value={profile.mediumSolved} accentClass="text-amber-600 dark:text-amber-300" />
        <Metric label="Hard" value={profile.hardSolved} accentClass="text-rose-600 dark:text-rose-300" />
        <Metric label="Ranking" value={profile.ranking} accentClass="text-slate-700 dark:text-slate-200" />
      </div>
    </section>
  )
}

export default ProfileCard
