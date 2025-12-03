import Link from "next/link";
import ModeToggle from "./ThemeToggle";
import IconGithub from "./icon/IconGithub";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface IHeader {
  title: string | undefined;
}

const navLinks = [
  {
    href: "/playground",
    label: "플레이그라운드",
  },
];

export default function Header({ title }: IHeader) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="w-full mx-auto flex justify-between h-14 px-20 max-md:flex-col max-md:h-20 max-md:items-center">
        <div className="flex flex-1 items-center gap-4">
          <Link
            href="/blog"
            className="font-semibold max-[360px]:text-sm"
            title={title}
          >
            {title}
          </Link>
        </div>
        {/* 우측: 데스크톱 내비 */}
        <nav className="hidden md:flex gap-4 text-sm items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-violet-600 font-bold"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="ghost" size="icon" aria-label="Github">
            <Link
              href="https://github.com/InwooLeeme"
              target="_blank"
              rel="noreferrer"
            >
              <IconGithub width={20} height={20} />
            </Link>
          </Button>
          <ModeToggle />
        </nav>

        {/* 모바일: 햄버거 + 다크모드 + 깃허브(선택) */}
        <div className="md:hidden flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Github">
            <Link
              href="https://github.com/InwooLeeme"
              target="_blank"
              rel="noreferrer"
            >
              <IconGithub width={20} height={20} />
            </Link>
          </Button>
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-4 space-y-4">
                {navLinks.map((n) => (
                  <SheetClose asChild key={n.href}>
                    <Link href={n.href} className={`block text-base`}>
                      {n.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
