import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pizzaantioquia.com"),
  title: {
    default: "Pizza Antioquia | Domicilios de Pizza Artesanal en Medellín",
    template: "%s | Pizza Antioquia",
  },
  description:
    "Pizza Antioquia – el mejor servicio de domicilios de pizzas artesanales en Medellín, Colombia. Cobertura en Laureles, Norte, Envigado y El Poblado. Pedidos en línea, pago seguro con Wompi.",
  keywords: [
    "pizza Medellín",
    "domicilios pizza Medellín",
    "pizza artesanal Medellín",
    "pizza Laureles",
    "pizza Envigado",
    "pizza a domicilio Colombia",
    "Pizza Antioquia",
    "pizza delivery Medellín",
  ],
  authors: [{ name: "Pizza Antioquia" }],
  creator: "Pizza Antioquia",
  publisher: "Pizza Antioquia",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    alternateLocale: "en_US",
    url: "https://pizzaantioquia.com",
    siteName: "Pizza Antioquia",
    title: "Pizza Antioquia | Domicilios de Pizza Artesanal en Medellín",
    description:
      "El mejor servicio de domicilios de pizzas artesanales en Medellín, Colombia.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pizza Antioquia – Domicilios en Medellín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pizza Antioquia | Domicilios en Medellín",
    description: "El mejor servicio de domicilios de pizzas artesanales en Medellín.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://pizzaantioquia.com",
    languages: {
      "es-CO": "https://pizzaantioquia.com",
      "en-US": "https://pizzaantioquia.com/en",
    },
  },
  verification: {
    google: "google-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#b31212" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://pizzaantioquia.com",
              name: "Pizza Antioquia",
              description:
                "Servicio de domicilios de pizzas artesanales en Medellín, Colombia.",
              url: "https://pizzaantioquia.com",
              telephone: "+573145550101",
              image: "https://pizzaantioquia.com/og-image.jpg",
              priceRange: "$$",
              servesCuisine: "Pizza",
              currenciesAccepted: "COP",
              paymentAccepted: "Cash, Credit Card, PSE",
              areaServed: [
                { "@type": "City", name: "Medellín" },
                { "@type": "City", name: "Envigado" },
              ],
              hasMap: "https://maps.google.com/?cid=pizzaantioquia",
              sameAs: [
                "https://instagram.com/pizzaantioquia",
                "https://facebook.com/pizzaantioquia",
                "https://tiktok.com/@pizzaantioquia",
              ],
              address: [
                {
                  "@type": "PostalAddress",
                  streetAddress: "Cra. 70 #44-10",
                  addressLocality: "Laureles",
                  addressRegion: "Antioquia",
                  addressCountry: "CO",
                },
                {
                  "@type": "PostalAddress",
                  streetAddress: "Cll. 37 Sur #43A-15",
                  addressLocality: "Envigado",
                  addressRegion: "Antioquia",
                  addressCountry: "CO",
                },
              ],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "11:00",
                  closes: "22:00",
                },
              ],
              menu: "https://pizzaantioquia.com/#menu",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Pizza Menu",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "FoodService",
                      name: "Hawaiana Artesanal",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "FoodService",
                      name: "Americana",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "FoodService",
                      name: "Carnis",
                    },
                  },
                ],
              },
            }),
          }}
        />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
