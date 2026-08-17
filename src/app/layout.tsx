import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
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

const SITE_URL = "https://jwparfum.com";
// Use /banner/og.jpg (1200×630, <600 KB) for WhatsApp & social. Generate with: pnpm run og:image
const OG_IMAGE_PATH = "/banner/og.jpg";
const FAVICON_PATH = "/favicon.jpg";

// Keep under 60 chars for best display on social (e.g. WhatsApp)
const DEFAULT_TITLE = "JW PARFUM — Perfumería en línea";
const DEFAULT_DESCRIPTION =
  "Perfumes originales para él y para ella. Catálogo en línea, pedido sin cuenta y confirmación por WhatsApp. Envíos en República Dominicana.";
const OG_IMAGE_ALT = "JW PARFUM — Perfumería en línea";

const ogImage = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
  type: "image/jpeg" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | JW PARFUM",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "JW PARFUM",
  keywords: [
    "JW Parfum",
    "perfumes",
    "perfumería",
    "fragancias",
    "perfumes originales",
    "perfumes para hombre",
    "perfumes para mujer",
    "República Dominicana",
  ],
  authors: [{ name: "JW PARFUM", url: SITE_URL }],
  creator: "JW PARFUM",
  publisher: "JW PARFUM",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_URL,
    siteName: "JW PARFUM",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [ogImage],
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
  category: "shopping",
  icons: {
    icon: [{ url: FAVICON_PATH, type: "image/jpeg" }],
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
  verification: {
    // Añade cuando tengas: google: "tu-codigo-google-search-console",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0e",
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}`;

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
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
