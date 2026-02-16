const SkeletonBadgeGrid = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="aspect-square rounded-xl bg-white/5 border border-white/10 animate-pulse"
      />
    ))}
  </div>
);

export default SkeletonBadgeGrid;
