"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

interface NavigationItem {
  href: string;
  label: string;
  pathname: string;
  hash?: string;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { href: "/", label: "Home", pathname: "/" },
  { href: "/#about", label: "About us", pathname: "/", hash: "#about" },
  {
    href: "/#modalities",
    label: "Modalities",
    pathname: "/",
    hash: "#modalities",
  },
  {
    href: "/#process",
    label: "How it works",
    pathname: "/",
    hash: "#process",
  },
  {
    href: "/service-information",
    label: "Service information",
    pathname: "/service-information",
  },
];

const SECTION_HASHES = new Set(
  NAVIGATION_ITEMS.flatMap((item) => (item.hash ? [item.hash] : [])),
);

function subscribeToHashChanges(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
  hash: string,
) {
  if (item.pathname !== pathname) return false;
  if (item.hash) return item.hash === hash;
  if (pathname !== "/") return true;

  return !SECTION_HASHES.has(hash);
}

/** Render primary links with current route and section semantics. */
export function PrimaryNavigation() {
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    subscribeToHashChanges,
    getHashSnapshot,
    getServerHashSnapshot,
  );

  return (
    <nav className="site-menu" aria-label="Main menu">
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = isNavigationItemActive(item, pathname, hash);

        return (
          <Link
            className={`nav-link${isActive ? " nav-link-active" : ""}`}
            href={item.href}
            aria-current={
              isActive ? (item.hash ? "location" : "page") : undefined
            }
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
