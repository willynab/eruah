import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const popupForgeCreateProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    type: z.enum(['info', 'warning', 'success', 'error']),
    active: z.boolean().default(true),
    startDate: z.string(),
    endDate: z.string(),
    targetAudience: z.enum(['all', 'members', 'admins']).default('all'),
  }))
  .mutation(async ({ input }) => {
    const { title, content, type, active, startDate, endDate, targetAudience } = input;
    
    const { data, error } = await supabase
      .from('popup_forge')
      .insert({
        title,
        content,
        type,
        active,
        start_date: startDate,
        end_date: endDate,
        target_audience: targetAudience,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });