import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { BRAND_DESCRIPTION, BRAND_NAME, SITE_URL } from "@/config/brand";
import { CartProvider } from "@/contexts/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const OG_IMAGE_PATH = "/banner/og.jpg";
const FAVICON_PATH = "/favicon.svg";

const DEFAULT_TITLE = `${BRAND_NAME} — Las marcas que quieres, en RD`;
const OG_IMAGE_ALT = `${BRAND_NAME} — Belleza, relojes, perfumes, gorras y tenis`;

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
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: [
    BRAND_NAME,
    "belleza",
    "relojes",
    "perfumes",
    "gorras",
    "tenis",
    "sneakers",
    "República Dominicana",
  ],
  authors: [{ name: BRAND_NAME, url: SITE_URL }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: DEFAULT_TITLE,
    description: BRAND_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: BRAND_DESCRIPTION,
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
    icon: [{ url: FAVICON_PATH, type: "image/svg+xml" }],
    shortcut: FAVICON_PATH,
    apple: FAVICON_PATH,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const themeScript = `try{localStorage.setItem('theme','light');document.documentElement.classList.remove('dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
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
