import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight text-black">
          Prism
        </Link>
        <nav>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
