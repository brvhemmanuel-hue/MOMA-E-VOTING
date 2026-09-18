import type { Metadata } from "next";
import { SCHOOL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Get Access Code",
  description: `Generate your one-time voting access code for the ${SCHOOL_NAME} student elections.`,
};

export default function GenerateCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
