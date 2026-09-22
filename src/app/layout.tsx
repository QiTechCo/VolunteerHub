import type { Metadata } from "next";
import { EB_Garamond, League_Spartan } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb",
  weight: ["400", "500", "600", "700"],
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-spartan",
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Volunteer Hub — Dimple Ajmera for Charlotte",
    template: "%s — Volunteer Hub",
  },
  description:
    "Volunteer Hub for Dimple Ajmera’s Charlotte campaign: how to help, shift signup, hours, and coordinator tools.",
  icons: {
    icon: "/volunteer-hub-logo.jpg",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${leagueSpartan.variable} light h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
