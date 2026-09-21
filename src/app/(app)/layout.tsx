import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zweite Verteidigungslinie: proxy.ts leitet bereits um, aber Auth gehört auch nah an die Daten.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email ?? "Nutzer";

  return (
    <div className="flex flex-1">
      <Sidebar displayName={displayName} />
      {/* pb-20: Platz für die fixe BottomNav auf Mobile */}
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
