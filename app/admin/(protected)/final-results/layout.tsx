import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Results Report",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
