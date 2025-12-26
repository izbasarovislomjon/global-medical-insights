// Public backend function: returns a short-lived signed URL for an article PDF.
// This keeps the submissions bucket private while allowing anyone to read/download published article PDFs.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

serve(async (req) => {
  console.log(`[article-pdf] ${req.method} ${new URL(req.url).pathname}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const body = (await req.json().catch(() => ({}))) as { articleId?: string };
    const articleId = body.articleId;

    if (!articleId) {
      return new Response(JSON.stringify({ error: "Missing articleId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: article, error: articleError } = await admin
      .from("articles")
      .select("pdf_url")
      .eq("id", articleId)
      .maybeSingle();

    if (articleError) {
      return new Response(JSON.stringify({ error: articleError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfPath = (article as { pdf_url: string | null } | null)?.pdf_url;
    if (!pdfPath) {
      return new Response(JSON.stringify({ error: "PDF not available" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic path validation: prevent path traversal and absolute paths.
    if (pdfPath.includes("..") || pdfPath.startsWith("/")) {
      return new Response(JSON.stringify({ error: "Invalid PDF path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NOTE: Today, published article PDFs are stored in the private "manuscripts" bucket.
    // We return a signed URL that works for anonymous visitors.
    const { data: signed, error: signError } = await admin.storage
      .from("manuscripts")
      .createSignedUrl(pdfPath, 60 * 10);

    if (signError || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: signError?.message ?? "Could not create signed URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resBody: Json = { url: signed.signedUrl };
    return new Response(JSON.stringify(resBody), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
