import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vote Confirmation",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
