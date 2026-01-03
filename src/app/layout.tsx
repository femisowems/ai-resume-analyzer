import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "CareerAI - AI-Powered Resume Analysis & Job Application Tracking",
  description: "Optimize your resume with AI-powered analysis, track job applications, get interview prep, and land more interviews. Built with GPT-4o, Next.js, and Supabase.",
  keywords: ["resume analysis", "AI resume", "job application tracker", "interview prep", "career platform", "resume optimization"],
  authors: [{ name: "CareerAI Team" }],
  openGraph: {
    title: "CareerAI - Land Your Dream Job with AI",
    description: "AI-powered resume analysis, job matching, and interview preparation to help you succeed.",
    type: "website",
  },
};

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
        {children}
      </body>
    </html>
  );
}
