import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fyndsol Location Intelligence",
  description:
    "Fyndsol Location Intelligence helps you understand demand, competition, accessibility, nearby amenities and business fit before you choose a location.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-brand-bg font-sans text-brand-text antialiased">
        {children}
      </body>
    </html>
  );
}
