"use client";

import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Bell, Globe, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Topbar() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as string) || "ar";
  const [showUser, setShowUser] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(newLocale: string) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setShowLang(false);
  }

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-5 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm font-bold text-text-bright">
        <img src="/logo.png" alt="SentraX" className="w-7 h-7 object-contain" />
        SentraX ERP
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-text-dim hover:text-text transition rounded hover:bg-surface2">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div ref={langRef} className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center gap-1.5 p-2 text-text-dim hover:text-text transition rounded hover:bg-surface2"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{locale}</span>
          </button>
          {showLang && (
            <div className="absolute top-full mt-1 end-0 bg-surface2 border border-border rounded shadow-lg py-1 min-w-24 z-30">
              {[
                { code: "ar", label: "العربية" },
                { code: "he", label: "עברית" },
                { code: "en", label: "English" },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`block w-full text-start px-3 py-1.5 text-sm hover:bg-accent/10 transition ${
                    locale === l.code ? "text-accent" : "text-text-dim"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 p-2 text-text-dim hover:text-text transition rounded hover:bg-surface2"
          >
            <User className="w-4 h-4" />
            <span className="text-xs">{session?.user?.name}</span>
          </button>
          {showUser && (
            <div className="absolute top-full mt-1 end-0 bg-surface2 border border-border rounded shadow-lg py-1 min-w-36 z-30">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs text-text-bright">{session?.user?.name}</p>
                <p className="text-xs text-text-dim font-mono">{(session?.user as any)?.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {locale === "ar" ? "خروج" : locale === "he" ? "יציאה" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
