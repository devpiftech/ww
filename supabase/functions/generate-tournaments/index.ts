
// This edge function is used to generate random tournaments
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Generate tournament data
    const tournaments = await generateTournaments();
    
    // Insert new tournaments into database
    const { data, error } = await supabaseClient
      .from('tournaments')
      .insert(tournaments)
      .select();
      
    if (error) throw error;
    
    console.log(`Generated ${data.length} new tournaments`);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating tournaments:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to generate random tournaments
async function generateTournaments() {
  const now = new Date();
  
  // Create daily tournament ending at midnight
  const dailyEnd = new Date();
  dailyEnd.setHours(23, 59, 59, 999);
  
  // Create weekly tournament ending on Sunday
  const weeklyEnd = new Date();
  weeklyEnd.setDate(weeklyEnd.getDate() + (7 - weeklyEnd.getDay()));
  weeklyEnd.setHours(23, 59, 59, 999);
  
  // Create monthly tournament ending on the last day of the month
  const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Generate various tournament types
  return [
    {
      title: 'Daily Slots Tournament',
      description: 'Win the highest amount in a single spin',
      start_time: now.toISOString(),
      end_time: dailyEnd.toISOString(),
      prize_pool: 10000,
      game_type: 'slots',
      tournament_type: 'daily',
      status: 'active',
      is_active: true
    },
    {
      title: 'Weekly Slots Championship',
      description: 'Accumulate the highest winnings over the week',
      start_time: now.toISOString(),
      end_time: weeklyEnd.toISOString(),
      prize_pool: 50000,
      game_type: 'slots',
      tournament_type: 'weekly',
      status: 'active',
      is_active: true
    },
    {
      title: 'Daily Quiz Challenge',
      description: 'Get the highest score in today\'s quiz',
      start_time: now.toISOString(),
      end_time: dailyEnd.toISOString(),
      prize_pool: 5000,
      game_type: 'quiz',
      tournament_type: 'daily',
      status: 'active',
      is_active: true
    }
  ];
}
