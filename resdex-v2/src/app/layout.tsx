import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/SmoothCursor";
import { AuthProvider } from '@/components/auth-provider';
import NotificationSidebarProvider from '@/components/ui/NotificationSidebarProvider';
import { Footer7 } from "@/components/footer7";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResDex - Rediscover the World of Research",
  description: "Explore, connect, and stay updated with the latest in research and academia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes, maximum-scale=1, minimum-scale=1" />
        <link rel="icon" href="/beige-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SmoothCursor />
          <NotificationSidebarProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
              <div className="flex justify-center w-full">
                <Footer7
                  logo={{
                    url: "/",
                    src: "/beige-logo.png",
                    alt: "ResDex Logo",
                    title: "ResDex"
                  }}
                  sections={[
                    {
                      title: "Product",
                      links: [
                        { name: "Overview", href: "#" },
                        { name: "Pricing", href: "#" },
                        { name: "Marketplace", href: "#" },
                        { name: "Features", href: "#" },
                      ],
                    },
                    {
                      title: "Company",
                      links: [
                        { name: "About", href: "/about" },
                        { name: "Team", href: "#" },
                        { name: "Blog", href: "#" },
                        { name: "Careers", href: "#" },
                      ],
                    },
                    {
                      title: "Resources",
                      links: [
                        { name: "Help", href: "#" },
                        { name: "Sales", href: "#" },
                        { name: "Advertise", href: "#" },
                        { name: "Privacy", href: "#" },
                      ],
                    },
                  ]}
                />
              </div>
            </div>
          </NotificationSidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
