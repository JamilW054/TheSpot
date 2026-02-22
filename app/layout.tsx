import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://buxxep.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Buxxep — Moda atemporal, alma moderna. Ropa personalizada y streetwear",
    template: "%s | Buxxep",
  },
  description:
    "Diseña y compra ropa personalizada. Camisetas, hoodies y streetwear con tu estilo. Editor 3D, calidad y envíos. Moda urbana en República Dominicana.",
  keywords: [
    "Buxxep",
    "ropa personalizada",
    "streetwear",
    "editor 3D",
    "camisetas personalizadas",
    "hoodies",
    "moda urbana",
    "República Dominicana",
    "diseño de prendas",
  ],
  authors: [{ name: "Buxxep", url: SITE_URL }],
  creator: "Buxxep",
  publisher: "Buxxep",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_URL,
    siteName: "Buxxep",
    title: "Buxxep — Moda atemporal, alma moderna",
    description:
      "Diseña y compra ropa personalizada. Streetwear, editor 3D y calidad. Moda urbana.",
    images: [
      {
        url: "/banner/1.png",
        width: 1200,
        height: 630,
        alt: "Buxxep — Moda atemporal, alma moderna. Ropa personalizada y streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buxxep — Moda atemporal, alma moderna",
    description: "Ropa personalizada, streetwear y editor 3D. Diseña la tuya.",
    images: ["/banner/1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "fashion",
  icons: {
    icon: "/favicon.jpg",
  },
  verification: {
    // Añade cuando tengas: google: "tu-codigo-google-search-console",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0e" },
  ],
};

const themeScript = `
(function() {
  var key = 'buxxep-theme';
  var stored = localStorage.getItem(key);
  var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
