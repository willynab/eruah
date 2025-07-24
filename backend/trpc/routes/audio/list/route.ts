import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const audioListProcedure = publicProcedure
  .input(z.object({
    published: z.boolean().optional(),
    categoryId: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ input }) => {
    const { published, categoryId, limit, offset } = input;
    
    let query = supabase
      .from('audio_teachings')
      .select(`
        *,
        categories (
          id,
          name,
          color
        ),
        users (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (published !== undefined) {
      query = query.eq('published', published);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  });