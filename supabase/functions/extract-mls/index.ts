import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert at reading Canadian MLS (Multiple Listing Service) property listing sheets.
Given an MLS listing document (PDF or image), extract ALL property details you can find and return them as a JSON object.

Return ONLY a JSON object with these fields (use null for any field you cannot find):
{
  "propertyType": "one of: Detached, Semi-Detached, Townhouse / Row, Multi-Unit Residential, Condo, Apartment, Duplex, Triplex",
  "yearBuilt": "4-digit year as string",
  "sqft": "number as string, no commas",
  "units": "number as string",
  "storeys": "number as string, e.g. 2 or 1.5",
  "constructionType": "one of: Brick, Brick Veneer, Frame with Vinyl Siding, Frame with Aluminum Siding, Concrete Block, Stone, Stucco, Other",
  "heatingType": "one of: Forced Air Gas, Forced Air Electric, Baseboard Electric, Hot Water Radiator, Radiant In-Floor, Heat Pump, Other",
  "roofType": "one of: Asphalt Shingle, Metal, Flat (Modified Bitumen), Flat (EPDM/TPO), Cedar Shake, Slate, Tile, Other",
  "basement": "one of: Full, Finished / Full, Unfinished / Full, Partially Finished / Partial, Finished / Partial, Unfinished / Crawl Space / None",
  "replacementCost": "estimated replacement cost as string, no commas. If not listed, estimate from list price and property characteristics.",
  "listPrice": "listing price as string, no commas",
  "salePrice": "sale price as string, no commas, or null",
  "address": "full property address",
  "bedrooms": "number as string",
  "bathrooms": "number as string",
  "lotSize": "lot dimensions or area as string",
  "confidence": 0.85
}

Map MLS terminology to the exact dropdown values listed above. For example:
- "2-Storey" → storeys: "2"
- "Brick" or "All Brick" → constructionType: "Brick"
- "Gas Forced Air" → heatingType: "Forced Air Gas"
- "Shingle" → roofType: "Asphalt Shingle"
- "Det" or "Detached" → propertyType: "Detached"
- "Semi" or "Semi-Det" → propertyType: "Semi-Detached"
- "Link" or "Row" or "Town" → propertyType: "Townhouse / Row"
- "Fin" or "Finished" for basement → "Full, Finished"

For replacement cost: if not directly stated, estimate it as approximately 60-80% of the list price for a standard property, adjusting up for newer/larger/premium builds and down for older/smaller properties.

Return ONLY valid JSON, no markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, mimeType, fileName } = await req.json();

    if (!fileBase64) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini for vision/document understanding
    const isPdf = mimeType === "application/pdf";
    const mediaType = isPdf ? "application/pdf" : mimeType;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mediaType};base64,${fileBase64}`,
            },
          },
          {
            type: "text",
            text: `Extract all property details from this MLS listing sheet (${fileName}). Return only the JSON object.`,
          },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI extraction service error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    let parsed: Record<string, any>;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Could not parse property data from the document.");
    }

    // Build mapped result
    const mapped: Record<string, string | undefined> = {};
    const rawFields: Record<string, string> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined && key !== "confidence") {
        rawFields[key] = String(value);
        mapped[key] = String(value);
      }
    }

    const result = {
      mapped,
      confidence: parsed.confidence || 0.7,
      rawFields,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-mls error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
