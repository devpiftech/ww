# Define the contents of the Supabase client initialization file using provided credentials
supabase_client_code = """
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
"""

# Save it to the `src/lib` directory
supabase_client_path = os.path.join(top_level_path, "src", "lib")
os.makedirs(supabase_client_path, exist_ok=True)
file_path = os.path.join(supabase_client_path, "supabaseClient.ts")

with open(file_path, "w") as f:
    f.write(supabase_client_code)

file_path
