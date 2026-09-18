import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { SCHOOL_NAME } from "@/lib/config";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const heading = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: `${SCHOOL_NAME} | Online Voting System`,
    template: `%s | ${SCHOOL_NAME}`,
  },
  description: `Secure online voting platform for ${SCHOOL_NAME} student elections.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
