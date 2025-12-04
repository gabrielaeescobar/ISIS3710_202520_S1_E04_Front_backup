import type { Metadata, Viewport } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layover",
  description: "Travel planning app",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#121212" />
      </head>
      <body suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .catch(function (err) {
                      console.error('Error al registrar el service worker:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
