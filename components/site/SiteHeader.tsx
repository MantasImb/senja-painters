"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const areaLinks = [
  { name: "Senja", href: "/no/senja" },
  { name: "Finnsnes", href: "/no/finnsnes" },
];

const serviceLinks = [
  { name: "Innvendig maling", href: "/no/innvendig-maling" },
  { name: "Utvendig maling", href: "/no/utvendig-maling" },
  { name: "Møbelmaling", href: "/no/mobelmaling" },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isTransparent = !isScrolled;

  useEffect(() => {
    function updateScrolledState() {
      setIsScrolled(window.scrollY > 24);
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  return (
    <header
      className={cn(
        "left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,color,backdrop-filter] duration-300",
        overlay ? "fixed" : "sticky",
        isTransparent
          ? cn(
              "border-transparent bg-transparent shadow-none",
              overlay ? "text-white" : "text-neutral-950",
            )
          : "border-neutral-200 bg-white/94 text-neutral-950 shadow-sm shadow-black/5 backdrop-blur-md",
      )}
      data-scrolled={isScrolled ? "true" : "false"}
    >
      <nav
        aria-label="Hovednavigasjon"
        className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8"
      >
        <Link className="shrink-0 text-xl font-semibold" href="/no">
          Senja Malere
        </Link>
        <NavigationMenu className="justify-end" viewport={false}>
          <NavigationMenuList className="flex-wrap justify-end gap-1">
            <LinkGroup
              links={areaLinks}
              title="Områder"
              transparent={isTransparent && overlay}
            />
            <LinkGroup
              links={serviceLinks}
              title="Tjenester"
              transparent={isTransparent && overlay}
            />
            <NavigationMenuItem>
              <HeaderNavigationLink
                href="/no/kontakt"
                transparent={isTransparent && overlay}
              >
                Kontakt
              </HeaderNavigationLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <HeaderNavigationLink
                href="/no/personvern"
                transparent={isTransparent && overlay}
              >
                Personvern
              </HeaderNavigationLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
}

function LinkGroup({
  links,
  title,
  transparent,
}: {
  links: { name: string; href: string }[];
  title: string;
  transparent: boolean;
}) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "rounded-[6px] px-3 py-2 text-sm font-medium",
          transparent
            ? "!text-white/88 hover:!bg-white/12 hover:!text-white focus:!bg-white/12 focus:!text-white data-[state=open]:!bg-white/12 data-[state=open]:!text-white data-open:!bg-white/12 data-open:!text-white data-popup-open:!bg-white/12 data-popup-open:!text-white"
            : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus:bg-neutral-100 data-open:bg-neutral-100 data-popup-open:bg-neutral-100",
        )}
      >
        {title}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="min-w-56 p-2">
        <div className="grid gap-1">
          {links.map((link) => (
            <NavigationMenuLink
              asChild
              className="rounded-[6px] px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus:bg-neutral-100"
              key={link.href}
            >
              <Link href={link.href}>{link.name}</Link>
            </NavigationMenuLink>
          ))}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function HeaderNavigationLink({
  children,
  href,
  transparent,
}: {
  children: ReactNode;
  href: string;
  transparent: boolean;
}) {
  return (
    <NavigationMenuLink
      asChild
      className={cn(
        "rounded-[6px] px-3 py-2 text-sm font-medium",
        transparent
          ? "text-white/88 hover:bg-white/12 hover:text-white focus:bg-white/12"
          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 focus:bg-neutral-100",
      )}
    >
      <Link href={href}>{children}</Link>
    </NavigationMenuLink>
  );
}
