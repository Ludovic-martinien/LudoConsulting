export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminEnv } = await import("@/lib/admin-config");
    await ensureAdminEnv().catch(() => undefined);
  }
}
