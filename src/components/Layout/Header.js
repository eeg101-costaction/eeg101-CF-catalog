"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/resources") {
      return pathname === "/resources" || pathname.startsWith("/resources/");
    }
    return pathname === path;
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About us" },
  ];

  return (
    <header
      className="fixed w-full top-0 z-50 flex items-center justify-center h-20"
      style={{ background: "var(--surface-primary)" }}
    >
      <Image
        src="/assets/icons/logo-v1.png"
        alt="logo icon"
        width={220}
        height={80}
        style={{
          objectFit: "contain",
          position: "absolute",
          left: 10,
          top: 0,
        }}
        priority
      />

      <nav className="flex items-center gap-4">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-block px-6 py-2 rounded-2xl no-underline translate-y-0 hover:translate-y-[-4px] hover:font-bold ${
                active ? "font-bold" : "hover:text-[var(--text-primary)]"
              }`}
              style={{
                fontSize: "var(--font-size-h3)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: active
                  ? "var(--background-non-opaque)"
                  : "transparent",
                transition: "all var(--transition-slow) ease-in-out",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
