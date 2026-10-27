"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Member = { id: number; name: string; email: string; image: string | null };

type MemberContextValue = { member: Member | null; loading: boolean; refresh: () => Promise<void> };

const MemberContext = createContext<MemberContextValue>({ member: null, loading: true, refresh: async () => {} });

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/member/session", { cache: "no-store" });
      const data = await response.json() as { member?: Member | null };
      setMember(data.member ?? null);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(() => ({ member, loading, refresh }), [member, loading, refresh]);
  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  return useContext(MemberContext);
}
