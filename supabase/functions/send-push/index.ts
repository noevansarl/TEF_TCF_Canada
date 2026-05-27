import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { JWT } from "npm:google-auth-library";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gérer les requêtes CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Lire et parser la clé du compte de service Firebase
    const serviceAccountJson = Deno.env.get("FCM_SERVICE_ACCOUNT_KEY");
    if (!serviceAccountJson) {
      throw new Error("Missing FCM_SERVICE_ACCOUNT_KEY environment variable.");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // 2. Récupérer les paramètres du push
    const { token, title, body, data } = await req.json();

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, title, body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Obtenir l'access token OAuth2 via la librairie Google
    const client = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const credentials = await client.authorize();
    const accessToken = credentials.access_token;

    if (!accessToken) {
      throw new Error("Failed to retrieve Google OAuth2 access token.");
    }

    // 4. Construire et envoyer la requête FCM v1
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
    
    const response = await fetch(fcmUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: token,
          notification: {
            title: title,
            body: body,
          },
          data: data || {}, // Payload optionnel
        },
      }),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: response.ok, result }),
      { 
        status: response.ok ? 200 : 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
