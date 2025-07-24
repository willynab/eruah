// lib/config.ts - Configuration centralisée
export const config = {
  // URLs
  appUrl: process.env.EXPO_PUBLIC_APP_URL || 'http://localhost:8081',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  
  // Environnement
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'local',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// lib/supabase.ts - Configuration Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// backend/trpc/create-context.ts - Configuration tRPC
import { config } from '../../lib/config';

// Utilisation dans vos composants
import { config } from '@/lib/config';

export default function MyComponent() {
  console.log('API URL:', config.apiUrl);
  console.log('Environment:', config.environment);
  
  // Votre code...
}
