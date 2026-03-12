import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Manager",
  description: "Customer Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
