"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/brews", label: "Brews" },
  { href: "/admin/comments", label: "Comments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="page">
        <p style={{ padding: "40px 0", color: "var(--ink-dim)" }}>Checking sign-in…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="who-badge">
          <div className="avatar">{(user.email ?? "?").slice(0, 1).toUpperCase()}</div>
          {user.email}
        </div>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`admin-link ${pathname === link.href ? "active" : ""}`}>
            {link.label}
          </Link>
        ))}
        <button className="admin-link" style={{ marginTop: "auto" }} onClick={() => signOut(auth)}>
          Sign out
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
