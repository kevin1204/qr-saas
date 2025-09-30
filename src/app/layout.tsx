import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/components/ui/toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Orders - Restaurant Ordering System",
  description: "Multi-tenant QR ordering system for restaurants, cafés, and bars",
};

function ConditionalClerkProvider({ children }: { children: React.ReactNode }) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Only use ClerkProvider if we have a real key (not placeholder)
  if (clerkPublishableKey && !clerkPublishableKey.includes('placeholder')) {
    return (
      <ClerkProvider>
        {children}
      </ClerkProvider>
    );
  }
  
  // Return children without ClerkProvider for demo mode
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalClerkProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ConditionalClerkProvider>
      </body>
    </html>
  );
}
