const SkeletonBadgeGrid = () => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 place-items-center">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="w-24 aspect-[3/4] rounded-card bg-white/5 border border-white/10 animate-pulse"
      />
    ))}
  </div>
);

export default SkeletonBadgeGrid;
