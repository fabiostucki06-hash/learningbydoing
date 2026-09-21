import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">Willkommen zurück</h2>
      <AuthForm
        mode="login"
        initialError={
          error === "confirmation"
            ? "Der Bestätigungslink ist ungültig oder abgelaufen."
            : undefined
        }
      />
    </>
  );
}
