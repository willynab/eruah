import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }))
  .mutation(async ({ input }) => {
    const { email, password } = input;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      user: data.user,
      session: data.session,
    };
  });