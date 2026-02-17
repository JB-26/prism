export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-4 text-center text-sm text-gray-500">
        Built by{" "}
        <a
          href="https://www.joshblewitt.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm font-medium text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Joshua Blewitt
          <span className="sr-only">(opens in new tab)</span>
        </a>
      </div>
    </footer>
  );
}
