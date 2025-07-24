import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const prayersCreateProcedure = protectedProcedure
  .input(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    categoryId: z.string(),
    published: z.boolean().default(false),
    scheduledDate: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    const { title, content, categoryId, published, scheduledDate } = input;
    const userId = ctx.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('prayers')
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: userId,
        published,
        scheduled_date: scheduledDate || null,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  });