import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const categoriesListProcedure = publicProcedure
  .input(z.object({
    type: z.enum(['news', 'prayers', 'audio']).optional(),
  }))
  .query(async ({ input }) => {
    const { type } = input;
    
    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  });