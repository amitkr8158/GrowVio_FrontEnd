export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"
      />
    </div>
  );
}
