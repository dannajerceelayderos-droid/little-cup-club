import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/600.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { MotionRoot } from "@/components/MotionRoot";
import { StoreProvider } from "@/components/StoreProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { IllustrationDefs } from "@/components/illustrations";

export const metadata: Metadata = {
  title: { default: "Little Cup Club — Every cup has a story", template: "%s · Little Cup Club" },
  description: "A storybook guide to independent cafés across the Philippines. Explore the map, collect café stamps and share your favourite corners.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#FFF9EE" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <a href="#main" className="sr-only z-[100] rounded-full bg-ink px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <IllustrationDefs />
        <MotionRoot>
          <StoreProvider>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </StoreProvider>
        </MotionRoot>
      </body>
    </html>
  );
}
