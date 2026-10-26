import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { BuzzerAlert } from "./components/BuzzerAlert";
import { SensorsProvider } from "./components/SensorsProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-display", subsets: ["latin"] });

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Environment Monitoring using ESP8266 and MQTT",
  description: "Live temperature, humidity, light and buzzer readings from an ESP8266 over MQTT",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip"><SensorsProvider>
          <BuzzerAlert />
          {children}
        </SensorsProvider>
      </body>
    </html>
  );
}
