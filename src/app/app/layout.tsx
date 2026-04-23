import { BottomNav } from "@/components/app/bottom-nav";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return (
    <>
      <div className="mx-auto min-h-screen w-full max-w-md">{children}</div>
      <BottomNav />
    </>
  );
}
