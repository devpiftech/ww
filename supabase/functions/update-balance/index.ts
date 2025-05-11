
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Get and validate request body
    const { user_id, amount, type, game, metadata } = await req.json();
    
    if (!user_id || typeof amount !== 'number' || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Update user balance
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        balance: supabaseAdmin.sql`balance + ${amount}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select('balance')
      .single();
    
    if (profileError) {
      throw new Error(`Failed to update balance: ${profileError.message}`);
    }
    
    // Record the transaction
    const { error: transactionError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id,
        amount,
        type,
        game,
        metadata
      });
    
    if (transactionError) {
      throw new Error(`Failed to record transaction: ${transactionError.message}`);
    }
    
    // If this is a game result, record it in game_results
    if (type === 'bet' || type === 'win') {
      const { error: gameResultError } = await supabaseAdmin
        .from('game_results')
        .insert({
          user_id,
          bet_amount: type === 'bet' ? Math.abs(amount) : 0,
          win_amount: type === 'win' ? amount : 0,
          is_win: type === 'win',
          game: game || 'unknown',
          game_data: metadata
        });
      
      if (gameResultError) {
        console.error('Failed to record game result:', gameResultError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: profileData.balance,
        message: `Successfully ${type === 'win' ? 'added' : 'processed'} ${Math.abs(amount)} coins` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
