import type { Metadata } from "next";
import { SCHOOL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Admin Login",
  description: `Secure administrator sign-in for managing the ${SCHOOL_NAME} online voting system.`,
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
