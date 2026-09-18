import type { Metadata } from "next";
import { SCHOOL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Student Login",
  description: `Log in with your Student ID and access code to vote in the ${SCHOOL_NAME} student elections.`,
};

export default function StudentLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
