"use client";

import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isTransparent = !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    function updateScrolledState() {
      setIsScrolled(window.scrollY > 24);
    }

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    function closeAtDesktopWidth(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    }

    const desktopMediaQuery = window.matchMedia("(min-width: 768px)");

    window.addEventListener("keydown", closeOnEscape);
    desktopMediaQuery.addEventListener("change", closeAtDesktopWidth);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      desktopMediaQuery.removeEventListener("change", closeAtDesktopWidth);
    };
  }, [isMobileMenuOpen]);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

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
        className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-8 sm:py-4"
      >
        <Link className="shrink-0 text-xl font-semibold" href="/no">
          Senja Malere
        </Link>
        <NavigationMenu
          className="hidden justify-end md:flex"
          viewport={false}
        >
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
        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Lukk meny" : "Åpne meny"}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 md:hidden",
            isTransparent && overlay
              ? "text-white hover:bg-white/12 focus-visible:ring-offset-transparent"
              : "text-neutral-800 hover:bg-neutral-100 focus-visible:ring-offset-white",
          )}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          {isMobileMenuOpen ? (
            <XIcon aria-hidden="true" className="size-6" />
          ) : (
            <MenuIcon aria-hidden="true" className="size-6" />
          )}
        </button>
      </nav>
      {isMobileMenuOpen ? (
        <nav
          aria-label="Mobilnavigasjon"
          className="border-t border-neutral-200 bg-white text-neutral-950 shadow-lg shadow-black/8 md:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto max-h-[calc(100dvh-4.25rem)] max-w-7xl overflow-y-auto px-5 py-5 sm:px-8">
            <MobileLinkGroup
              links={areaLinks}
              onNavigate={closeMobileMenu}
              title="Områder"
            />
            <MobileLinkGroup
              className="mt-5"
              links={serviceLinks}
              onNavigate={closeMobileMenu}
              title="Tjenester"
            />
            <div className="mt-5 grid gap-1 border-t border-neutral-200 pt-4">
              <MobileNavigationLink
                href="/no/kontakt"
                onNavigate={closeMobileMenu}
              >
                Kontakt
              </MobileNavigationLink>
              <MobileNavigationLink
                href="/no/personvern"
                onNavigate={closeMobileMenu}
              >
                Personvern
              </MobileNavigationLink>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function MobileLinkGroup({
  className,
  links,
  onNavigate,
  title,
}: {
  className?: string;
  links: { name: string; href: string }[];
  onNavigate: () => void;
  title: string;
}) {
  return (
    <div className={className}>
      <p className="px-3 text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        {title}
      </p>
      <div className="mt-2 grid gap-1">
        {links.map((link) => (
          <MobileNavigationLink
            href={link.href}
            key={link.href}
            onNavigate={onNavigate}
          >
            {link.name}
          </MobileNavigationLink>
        ))}
      </div>
    </div>
  );
}

function MobileNavigationLink({
  children,
  href,
  onNavigate,
}: {
  children: ReactNode;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      className="flex min-h-11 items-center rounded-lg px-3 py-2 text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      href={href}
      onClick={onNavigate}
    >
      {children}
    </Link>
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
      <NavigationMenuContent className="min-w-56 border border-neutral-200 bg-white! p-2 text-neutral-950! shadow-lg shadow-black/10">
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
