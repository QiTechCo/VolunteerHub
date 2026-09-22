import type { Metadata, Viewport } from "next";
import { EB_Garamond, League_Spartan } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PwaProvider } from "@/components/pwa-provider";
import { MobileDock } from "@/components/mobile-dock";
import { getSession } from "@/lib/auth";
import { BASE_PATH } from "@/lib/constants";
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
  applicationName: "Volunteer Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Volunteer Hub",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${BASE_PATH}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${leagueSpartan.variable} light h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-cream text-foreground">
        <PwaProvider signedIn={Boolean(session)}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          {session ? <MobileDock kind={session.kind} /> : null}
        </PwaProvider>
      </body>
    </html>
  );
}
