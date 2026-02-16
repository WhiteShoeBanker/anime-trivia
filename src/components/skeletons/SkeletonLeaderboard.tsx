const SkeletonLeaderboard = () => (
  <div className="space-y-3">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface border border-white/10 animate-pulse"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-white/5" />
        </div>
        <div className="h-4 w-16 rounded bg-white/5" />
      </div>
    ))}
  </div>
);

export default SkeletonLeaderboard;
