// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

import { trpc, trpcClient } from "@/lib/trpc";

// 👇 Expose Supabase dans la console (utile en dev web)
if (typeof window !== "undefined") {
  window.supabase = supabase;
}

// Gestion du splash screen pour mobile
let SplashScreen: any = null;
if (Platform.OS !== "web") {
  try {
    SplashScreen = require("expo-splash-screen").SplashScreen;
    if (SplashScreen && SplashScreen.preventAutoHideAsync) {
      SplashScreen.preventAutoHideAsync();
    }
  } catch (error) {
    console.warn("SplashScreen not available:", error);
  }
}

export default function RootLayout() {
  useEffect(() => {
    if (SplashScreen?.hideAsync && Platform.OS !== "web") {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(console.warn);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
