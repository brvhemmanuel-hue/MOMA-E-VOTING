import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
