import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhdhnzfphcaekhdfhioc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZGhuemZwaGNhZWtoZGZoaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwNTU3NDcsImV4cCI6MjA0NDYzMTc0N30.2wJ6UV5k-f1LpezsclETDlLvgQ9P18E_1gl83YcK8-A'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Temporarily comment out AppState listener to see if it affects the error
// AppState.addEventListener('change', (state) => {
//   if (state === 'active') {
//     supabase.auth.startAutoRefresh()
//   } else {
//     supabase.auth.stopAutoRefresh()
//   }
// });
