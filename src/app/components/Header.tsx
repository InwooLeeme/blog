import Link from "next/link";
import ModeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="border-b">
          <div className="container mx-auto flex justify-between h-14 px-20 max-md:flex-col max-md:h-20 max-md:items-center">
            <div className="flex items-center gap-4">
            <Link href="/blog" className="font-semibold">My MDX Blog</Link>
            </div>
            <nav className="flex gap-4 text-sm items-center">
              <Link href="/About" className="hover:underline">About</Link>
              {/* github icon으로 대체할 예정 */}
              <a href="https://github.com" className="hover:underline" target="_blank" rel="noreferrer">GitHub</a>
              <ModeToggle />
            </nav>
          </div>
        </header>
      )
}