import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const audioCreateProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    audioUrl: z.string().url(),
    categoryId: z.string(),
    published: z.boolean().default(false),
    scheduledDate: z.string().optional(),
    duration: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { title, description, audioUrl, categoryId, published, scheduledDate, duration } = input;
    const userId = ctx.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('audio_teachings')
      .insert({
        title,
        description,
        audio_url: audioUrl,
        category_id: categoryId,
        author_id: userId,
        published,
        scheduled_date: scheduledDate || null,
        duration: duration || null,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });