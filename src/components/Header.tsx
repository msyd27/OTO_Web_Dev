import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const link =
    "px-3 py-2 rounded-lg hover:bg-[var(--brand-50)] transition-colors text-[var(--ink)]";

  // Desktop dropdown
  const [openDesktopMenu, setOpenDesktopMenu] = useState(false);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    setOpenDesktopMenu(true);
  };
  const closeSoon = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = setTimeout(() => setOpenDesktopMenu(false), 150);
  };

  // Mobile menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileListingsOpen, setMobileListingsOpen] = useState(false);

  // Esc closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDesktopMenu(false);
        setMobileOpen(false);
        setMobileListingsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="border-b z-[2000] border-[color:rgb(0_0_0_/_0.06)] bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Ontario Taraweeh Outreach Logo"
            width={200}
            height={60}
            priority
            className="h-20 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 relative">
            <Link className={link} href="/about">About</Link>
            <Link className={link} href="/apply">Apply</Link>

          {/* Listings dropdown (desktop) */}
          <div
            className="relative"
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openDesktopMenu}
              onClick={() => setOpenDesktopMenu(o => !o)}
              className={link + " flex items-center gap-1"}
            >
              Listings
              <ChevronDown open={openDesktopMenu} />
            </button>

            <div
              role="menu"
              aria-label="Listings"
              onMouseEnter={openNow}
              onMouseLeave={closeSoon}
              className={`absolute right-0 mt-2 w-56 rounded-xl border border-[color:rgb(0_0_0_/_0.08)] bg-white shadow-lg transition
                ${openDesktopMenu ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
            >
              <div className="p-1.5">
                <MenuLink href="/listings/all">All Listings</MenuLink>
                <MenuLink href="/listings/jummah">Jummah</MenuLink>
                <MenuLink href="/listings/taraweeh">Taraweeh</MenuLink>
                <MenuLink href="/listings/teaching">Teaching</MenuLink>
              </div>
            </div>
          </div>

          <Link className={link} href="/contact">Contact</Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen(o => {
              const newState = !o;
              if (!newState) setMobileListingsOpen(false);
              return newState;
            });
          }}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--brand-50)]"
        >
          <Hamburger open={mobileOpen} />
        </button>
      </div>

      {/* Mobile Panel */}
      <div
        className={`md:hidden overflow-hidden border-t border-[color:rgb(0_0_0_/_0.06)] transition-[max-height,opacity] duration-200
          ${mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mx-auto max-w-6xl px-4 py-3 space-y-1 bg-white">
          <MobileLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileLink>
          <MobileLink href="/apply" onClick={() => setMobileOpen(false)}>Apply</MobileLink>

          {/* Mobile Listings */}
          <div>
            <button
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--brand-50)] text-[var(--ink)]"
              aria-expanded={mobileListingsOpen}
              onClick={() => setMobileListingsOpen(v => !v)}
            >
              <span>Listings</span>
              <ChevronDown open={mobileListingsOpen} />
            </button>
            <div
              className={`pl-2 transition-[max-height,opacity] duration-200 overflow-hidden
                ${mobileListingsOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <MobileLink href="/listings/all" onClick={() => { setMobileOpen(false); setMobileListingsOpen(false); }}>
                All Listings
              </MobileLink>
              <MobileLink href="/listings/jummah" onClick={() => { setMobileOpen(false); setMobileListingsOpen(false); }}>
                Jummah
              </MobileLink>
              <MobileLink href="/listings/taraweeh" onClick={() => { setMobileOpen(false); setMobileListingsOpen(false); }}>
                Taraweeh
              </MobileLink>
              <MobileLink href="/listings/teaching" onClick={() => { setMobileOpen(false); setMobileListingsOpen(false); }}>
                Teaching
              </MobileLink>
            </div>
          </div>

          <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>Contact</MobileLink>
        </div>
      </div>
    </header>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* Desktop dropdown link item */
function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block px-3 py-2 rounded-lg hover:bg-[var(--brand-50)] text-[var(--ink)]"
    >
      {children}
    </Link>
  );
}

/* Mobile link style */
function MobileLink({href,children,onClick,}: {
  href: string;  children: React.ReactNode;  onClick?: () => void;}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 rounded-lg hover:bg-[var(--brand-50)] text-[var(--ink)]"
    >
      {children}
    </Link>
  );
}

/* Animated hamburger icon */
function Hamburger({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-6 flex flex-col justify-between items-center py-1.5">
      <span
        className={`h-0.5 w-full bg-[var(--ink)] rounded transition-transform duration-200 ${
          open ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full bg-[var(--ink)] rounded transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`h-0.5 w-full bg-[var(--ink)] rounded transition-transform duration-200 ${
          open ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </div>
  );
}

