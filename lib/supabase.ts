import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eqnyrnwrakqvxzhzttvw.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbnlybndyYWtxdnh6aHp0dHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDMyMjgsImV4cCI6MjA2ODg3OTIyOH0.2GE5PvhSFD3nKdgvRjsny1k7gT_YNkM0BQUQ_V9xZ0U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'member';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string;
          author_id: string;
          published: boolean;
          scheduled_date: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category_id: string;
          author_id: string;
          published?: boolean;
          scheduled_date?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category_id?: string;
          author_id?: string;
          published?: boolean;
          scheduled_date?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prayers: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string;
          author_id: string;
          published: boolean;
          scheduled_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category_id: string;
          author_id: string;
          published?: boolean;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category_id?: string;
          author_id?: string;
          published?: boolean;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audio_teachings: {
        Row: {
          id: string;
          title: string;
          description: string;
          audio_url: string;
          category_id: string;
          author_id: string;
          published: boolean;
          scheduled_date: string | null;
          duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          audio_url: string;
          category_id: string;
          author_id: string;
          published?: boolean;
          scheduled_date?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          audio_url?: string;
          category_id?: string;
          author_id?: string;
          published?: boolean;
          scheduled_date?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: 'news' | 'prayers' | 'audio';
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'news' | 'prayers' | 'audio';
          color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'news' | 'prayers' | 'audio';
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      popup_forge: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'success' | 'error';
          active: boolean;
          start_date: string;
          end_date: string;
          target_audience: 'all' | 'members' | 'admins';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'success' | 'error';
          active?: boolean;
          start_date: string;
          end_date: string;
          target_audience?: 'all' | 'members' | 'admins';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          active?: boolean;
          start_date?: string;
          end_date?: string;
          target_audience?: 'all' | 'members' | 'admins';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};