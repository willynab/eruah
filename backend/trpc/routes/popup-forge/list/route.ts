import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const popupForgeListProcedure = publicProcedure
  .input(z.object({
    active: z.boolean().optional(),
    targetAudience: z.enum(['all', 'members', 'admins']).optional(),
  }))
  .query(async ({ input }) => {
    const { active, targetAudience } = input;
    const now = new Date().toISOString();
    
    let query = supabase
      .from('popup_forge')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });
    
    if (active !== undefined) {
      query = query.eq('active', active);
    }
    
    if (targetAudience) {
      query = query.in('target_audience', ['all', targetAudience]);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  });