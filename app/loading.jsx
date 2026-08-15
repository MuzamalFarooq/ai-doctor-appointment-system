export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading MediConnect AI...</p>
        </div>
      </div>
    </div>
  );
}
