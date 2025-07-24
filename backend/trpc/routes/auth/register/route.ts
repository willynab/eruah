import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { supabase } from '../../../../lib/supabase';

export const registerProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(2),
  }))
  .mutation(async ({ input }) => {
    const { email, password, fullName } = input;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'member',
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }
    
    return {
      user: data.user,
      session: data.session,
    };
  });