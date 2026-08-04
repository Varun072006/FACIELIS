export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#173B72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#173B72] tracking-wider uppercase">Loading FACIELIS Platform...</p>
      </div>
    </div>
  );
}
