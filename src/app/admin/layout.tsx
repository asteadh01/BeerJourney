"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

const links = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/ideas", label: "Ideas" },
  { href: "/admin/experiments", label: "Experimentos" },
  { href: "/admin/brews", label: "Cervezas" },
  { href: "/admin/comments", label: "Comentarios" },
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
        <p style={{ padding: "40px 0", color: "var(--ink-dim)" }}>Verificando sesión…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin/profile" className={`who-badge ${pathname === "/admin/profile" ? "active" : ""}`}>
          <div className="avatar" style={user.photoURL ? { backgroundImage: `url(${user.photoURL})`, backgroundSize: "cover" } : undefined}>
            {!user.photoURL && (user.displayName ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <span className="who-name">{user.displayName ?? user.email}</span>
        </Link>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`admin-link ${pathname === link.href ? "active" : ""}`}>
            {link.label}
          </Link>
        ))}
        <button className="admin-link" style={{ marginTop: "auto" }} onClick={() => signOut(auth)}>
          Cerrar sesión
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
