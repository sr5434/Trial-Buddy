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

export const metadata = {
  title: "Trial Buddy",
  description: "Generate plain-language clinical trial overviews to help families discuss with their doctors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <footer className="mt-10 w-full text-center text-xs text-gray-500 py-6">
          This tool is for informational purposes only and does not provide medical advice. In an emergency, call your local emergency number.
        </footer>
      </body>
    </html>
  );
}
