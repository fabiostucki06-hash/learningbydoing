import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/features/auth/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const displayName = profile?.display_name ?? user!.email ?? "Nutzer";
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <>
      <PageHeader title="Profil" />

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-semibold text-white"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-medium">{displayName}</h2>
          <p className="truncate text-sm text-muted">{user!.email}</p>
        </div>
      </section>

      <form action={logout} className="mt-6">
        <Button type="submit" variant="secondary" className="w-full">
          <LogOut aria-hidden className="size-4" />
          Abmelden
        </Button>
      </form>
    </>
  );
}
