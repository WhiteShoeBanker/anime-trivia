const SkeletonCard = () => (
  <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden animate-pulse">
    <div className="h-[200px] bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-white/5" />
        <div className="h-5 w-12 rounded-full bg-white/5" />
      </div>
      <div className="h-4 w-24 rounded bg-white/5" />
    </div>
  </div>
);

export default SkeletonCard;
