import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";

export default async function StudentIndexPage() {
  const session = await getStudentSession();
  redirect(session ? "/student/vote" : "/student/login");
}
