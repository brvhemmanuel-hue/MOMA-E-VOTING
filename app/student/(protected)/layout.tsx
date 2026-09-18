import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { StudentNav } from "@/components/StudentNav";

export default async function StudentProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getStudentSession();
  if (!session) {
    redirect("/student/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <StudentNav fullname={session.fullname} />
      <div className="mx-auto max-w-5xl px-4 pb-10">{children}</div>
    </div>
  );
}
