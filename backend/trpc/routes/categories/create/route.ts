import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const categoriesCreateProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1),
    type: z.enum(['news', 'prayers', 'audio']),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
  }))
  .mutation(async ({ input }) => {
    const { name, type, color } = input;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        type,
        color,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });