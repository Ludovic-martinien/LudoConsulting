import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-shell";
import { BrandLockup } from "@/components/brand";
import { getAdminSession } from "@/lib/auth";
export const metadata = { title: "Connexion à l'administration", robots: { index: false, follow: false } };
export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const configured = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
  return <main className="login-wrap"><section className="login-card"><BrandLockup /><h1>Espace d'administration</h1><p>Connectez-vous avec le compte autorisé pour gérer les contenus et les demandes.</p>{!configured && <div className="admin-alert error" role="status"><strong>Configuration requise.</strong> Définissez ADMIN_EMAIL, ADMIN_PASSWORD_HASH (format scrypt:salt:hash) et ADMIN_SESSION_SECRET dans l’environnement de déploiement. Aucun accès par défaut n’est créé. Les étapes sont détaillées dans le README.</div>}<AdminLoginForm /></section></main>;
}
