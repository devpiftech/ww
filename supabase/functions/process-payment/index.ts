
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal SDK for server-side operations
async function generateAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_SECRET_KEY");
  
  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal API credentials");
  }
  
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  
  const data = await response.json();
  return data.access_token;
}

async function createPayPalOrder(amount: number, currency: string = "USD") {
  try {
    const accessToken = await generateAccessToken();
    
    const url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
        },
      ],
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    console.log("Order created:", data);
    return data;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
}

async function capturePayPalPayment(orderId: string) {
  try {
    const accessToken = await generateAccessToken();
    
    const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const data = await response.json();
    console.log("Payment captured:", data);
    return data;
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    throw error;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    const { action, user_id, amount, order_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Step 1: Create a PayPal order
    if (action === "create_order") {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return new Response(
          JSON.stringify({ error: "Valid amount is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      try {
        const waynebucksAmount = Math.floor(Number(amount) * 100); // $1 = 100 WayneBucks
        const order = await createPayPalOrder(Number(amount), "USD");
        
        if (!order.id) {
          throw new Error("Failed to create PayPal order");
        }
        
        // Record pending transaction
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id,
            amount: waynebucksAmount,
            type: 'purchase_pending',
            metadata: { 
              payment_provider: 'paypal',
              order_id: order.id,
              usd_amount: amount
            }
          });
          
        if (transactionError) {
          throw new Error(`Failed to record transaction: ${transactionError.message}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            order_id: order.id
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    
    // Step 2: Capture payment and credit WayneBucks
    else if (action === "capture_payment") {
      if (!order_id) {
        return new Response(
          JSON.stringify({ error: "Order ID is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      try {
        // Get the pending transaction to know how much to credit
        const { data: pendingTransaction, error: fetchError } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('user_id', user_id)
          .eq('type', 'purchase_pending')
          .eq('metadata->order_id', order_id)
          .single();
          
        if (fetchError || !pendingTransaction) {
          throw new Error(`No pending transaction found for this order`);
        }
        
        // Capture payment via PayPal
        const captureResult = await capturePayPalPayment(order_id);
        
        if (captureResult.status !== "COMPLETED") {
          throw new Error(`Payment capture failed: ${captureResult.status}`);
        }
        
        // Update user balance
        const { data: profileData, error: profileError } = await supabaseClient
          .from('profiles')
          .update({ 
            balance: supabaseClient.sql`balance + ${pendingTransaction.amount}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', user_id)
          .select('balance')
          .single();
        
        if (profileError) {
          throw new Error(`Failed to update balance: ${profileError.message}`);
        }
        
        // Update transaction from pending to complete
        const { error: updateError } = await supabaseClient
          .from('transactions')
          .update({ 
            type: 'purchase',
            metadata: { 
              ...pendingTransaction.metadata,
              payment_status: 'completed',
              capture_id: captureResult.id
            }
          })
          .eq('id', pendingTransaction.id);
        
        if (updateError) {
          throw new Error(`Failed to update transaction: ${updateError.message}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            balance: profileData.balance,
            waynebucks_credited: pendingTransaction.amount
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
