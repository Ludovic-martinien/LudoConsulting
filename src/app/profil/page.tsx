import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile-client";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez vos informations personnelles, votre e-mail, votre mot de passe et votre compte membre Ludo_Consulting.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
