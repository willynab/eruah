// lib/trpc.ts
import { Platform } from 'react-native';
import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // 1. Vérifier d'abord la variable d'environnement
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // 2. Fallback pour le développement
  if (__DEV__) {
    // Pour Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8081';
    }
    // Pour iOS Simulator et web
    return 'http://localhost:8081';
  }
  
  // 3. Pour la production (à adapter selon votre déploiement)
  return 'https://votre-api-production.com';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});