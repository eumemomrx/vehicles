import type { Metadata } from "next";
import './globals.css'
import { Quicksand } from 'next/font/google'
export const metadata: Metadata = {
  title: "Consulta de veículos",
  description: "",
};

const quicksand = Quicksand({
  weight: ['500', '600', '700'],
  subsets:['latin'],
  variable: '--font-oxanium',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
