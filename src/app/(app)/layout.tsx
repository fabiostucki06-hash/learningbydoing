import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PhoneFrame } from "@/components/layout/phone-frame";
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

  return (
    <PhoneFrame>
      <main className="scrollbar-none flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
        {children}
      </main>
      <BottomNav />
    </PhoneFrame>
  );
}
