import type { Metadata } from "next";
import { EB_Garamond, Inter, Manrope, Outfit } from "next/font/google";
import "./globals.css";
import { TrackerProvider } from "@/components/TrackerProvider";
import { initialTrackerState } from "@/lib/mock-data";
import { loadTrackerState, emptyTrackerState } from "@/lib/data/supabase-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
// Temporary display fallback until the licensed Tanod webfont is supplied.
const display = Outfit({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond" });

export const metadata: Metadata = {
  title: {
    default: "DIET Student Tracker",
    template: "%s | DIET Accelerator",
  },
  description: "Private ICAN Professional exam-preparation tracking portal by DIET Accelerator.",
  icons: {
    icon: "/brand/diet-icon.png",
    apple: "/brand/diet-icon.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let initialState = initialTrackerState;
  let currentUserId: string | null = "tolulope";
  let backend: "demo" | "supabase" = "demo";

  if (isSupabaseConfigured()) {
    backend = "supabase";
    initialState = emptyTrackerState;
    currentUserId = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUserId = user.id;
        initialState = await loadTrackerState(supabase);
      }
    } catch {
      // Authenticated pages still enforce access server-side. Keeping an empty
      // provider state here gives the UI a safe failure mode if loading fails.
    }
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} ${garamond.variable} ${manrope.variable} ${display.variable}`}>
        <TrackerProvider initialState={initialState} currentUserId={currentUserId} backend={backend}>
          {children}
        </TrackerProvider>
      </body>
    </html>
  );
}
