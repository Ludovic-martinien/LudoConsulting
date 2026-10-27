"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Member = { id: number; name: string; email: string; image: string | null };

type MemberContextValue = {
  member: Member | null;
  loading: boolean;
  googleReady: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  refresh: () => Promise<void>;
};

const MemberContext = createContext<MemberContextValue>({
  member: null,
  loading: true,
  googleReady: false,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  refresh: async () => {},
});

export function MemberProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleReady, setGoogleReady] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/member/session", { cache: "no-store" });
      const data = await response.json() as { member?: Member | null; googleReady?: boolean };
      setMember(data.member ?? null);
      setGoogleReady(data.googleReady === true);
    } catch {
      setMember(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo(
    () => ({ member, loading, googleReady, isModalOpen, openModal, closeModal, refresh }),
    [member, loading, googleReady, isModalOpen, openModal, closeModal, refresh],
  );
  return <MemberContext.Provider value={value}>{children}</MemberContext.Provider>;
}

export function useMember() {
  return useContext(MemberContext);
}
