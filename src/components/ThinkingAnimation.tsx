export default function ThinkingAnimation() {
  return (
    <div
      className="flex flex-col items-center justify-center py-20"
      role="status"
      aria-live="polite"
      aria-label="Analysing your CSV file, please wait"
    >
      <p
        className="mb-4 text-xl font-semibold text-gray-700"
        aria-hidden="true"
      >
        Thinking
      </p>
      <p className="mt-2 text-sm text-gray-500" aria-hidden="true">
        This usually takes 5–15 seconds
      </p>
      <div className="mt-4 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-bounce-dot inline-block h-3 w-3 rounded-full bg-gray-400"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}
