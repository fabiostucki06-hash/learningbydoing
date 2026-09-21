import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = { title: "Registrieren" };

export default function RegisterPage() {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">Konto erstellen</h2>
      <AuthForm mode="register" />
    </>
  );
}
