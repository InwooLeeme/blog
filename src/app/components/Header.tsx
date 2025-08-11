import Link from "next/link";
import ModeToggle from "./ThemeToggle";
import IconGithub from "./icon/IconGithub";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex justify-between h-14 px-20 max-md:flex-col max-md:h-20 max-md:items-center">
        <div className="flex items-center gap-4">
          <Link href="/blog" className="font-semibold">혼자 쓰는 메모장</Link>
        </div>
        <nav className="flex gap-4 text-sm items-center">
          <Link href="/About" className="hover:underline">About</Link>
          {/* github icon으로 대체할 예정 */}
          <Button asChild variant="ghost" size="icon" aria-label="Github">
            <Link href="https://github.com/InwooLeeme" target="_blank" rel="noreferrer"><IconGithub width={20} height={20} /></Link>
          </Button>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}