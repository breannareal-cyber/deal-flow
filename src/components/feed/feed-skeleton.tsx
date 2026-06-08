function SkeletonCard() {
  return (
    <div
      className="rounded-sm border p-6 flex flex-col gap-5 animate-pulse"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}
    >
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-3 w-24 rounded" style={{ backgroundColor: '#2a2a2a' }} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-2/3 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-3 w-1/3 rounded" style={{ backgroundColor: '#2a2a2a' }} />
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#252525' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-2 w-12 rounded" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="h-4 w-16 rounded" style={{ backgroundColor: '#2a2a2a' }} />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-full rounded" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-3 w-4/5 rounded" style={{ backgroundColor: '#2a2a2a' }} />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
    </div>
  );
}
