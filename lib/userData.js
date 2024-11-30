// lib/userData.js
import { supabase } from './supabase'

export const fetchUserData = async () => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const user = sessionData?.session?.user;

    if (user) {
      // Access the user_metadata directly from the user object
      return {
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
      };
    }
    
    return { first_name: '', last_name: '' };
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    return { first_name: '', last_name: '' }; // Return empty strings on error
  }
};


