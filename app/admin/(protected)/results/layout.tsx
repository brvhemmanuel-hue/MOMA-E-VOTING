import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Standings",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
