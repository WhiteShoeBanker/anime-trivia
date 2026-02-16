const SkeletonProfile = () => (
  <div className="flex flex-col items-center gap-6 animate-pulse">
    <div className="w-20 h-20 rounded-full bg-white/5" />
    <div className="h-6 w-40 rounded bg-white/5" />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-xl border border-white/10 p-4 space-y-2"
        >
          <div className="h-6 w-12 mx-auto rounded bg-white/5" />
          <div className="h-3 w-16 mx-auto rounded bg-white/5" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonProfile;
