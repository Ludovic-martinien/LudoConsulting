import { useSyncExternalStore } from "react";

export type MemberState = {
  loaded: boolean;
  user: { id: number; name: string; email: string; phone: string | null; avatar: string | null } | null;
  admin: boolean;
};

let state: MemberState = { loaded: false, user: null, admin: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function snapshot(): MemberState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setMemberState(patch: Partial<MemberState>) {
  state = { ...state, ...patch };
  emit();
}

let inflight: Promise<void> | null = null;

export function refreshMemberState(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const [meRes, adminRes] = await Promise.allSettled([
        fetch("/api/user/me", { credentials: "same-origin" }),
        fetch("/api/auth/session", { credentials: "same-origin" }),
      ]);
      let user: MemberState["user"] = null;
      let admin = false;
      if (meRes.status === "fulfilled" && meRes.value.ok) {
        const data = (await meRes.value.json().catch(() => null)) as { user: MemberState["user"] } | null;
        user = data?.user ?? null;
      }
      if (adminRes.status === "fulfilled" && adminRes.value.ok) {
        const data = (await adminRes.value.json().catch(() => null)) as { admin?: boolean } | null;
        admin = data?.admin === true;
      }
      state = { loaded: true, user, admin };
    } catch {
      state = { ...state, loaded: true };
    } finally {
      inflight = null;
      emit();
    }
  })();
  return inflight;
}

export function useMember(): MemberState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
