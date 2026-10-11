import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroBreach AI - SOC Dashboard",
  description: "Network Anomaly Detection & Threat Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global safe scrolling helper
              window.safeScrollTo = function(id, fallbackY) {
                try {
                  var el = typeof id === 'string' ? document.getElementById(id) : id;
                  if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else if (typeof fallbackY === 'number') {
                    window.scrollTo({ top: fallbackY, behavior: 'smooth' });
                  }
                } catch (e) {
                  console.warn('safeScrollTo fallback', e);
                }
              };
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
