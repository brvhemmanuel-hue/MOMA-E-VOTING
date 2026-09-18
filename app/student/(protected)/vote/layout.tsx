import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cast Your Vote",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
