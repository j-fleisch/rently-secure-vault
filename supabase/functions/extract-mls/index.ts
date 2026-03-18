import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert at reading Canadian MLS (Multiple Listing Service) property listing sheets from TREB (Toronto Regional Real Estate Board) and other Canadian real estate boards.

Given an MLS listing document (PDF or image), carefully locate and extract ALL property details. 

## WHERE TO FIND EACH FIELD ON A CANADIAN MLS SHEET

MLS sheets have a structured layout. Here is exactly where to find each field:

**TOP SECTION:**
- **Address**: Full property address, usually at the very top. May include TREB municipality code (e.g. C08) and community name.
- **List Price / Sale Price**: Top-left area, labeled "List" or "Lp" for list price, "Sp" for sale price. Remove $ and commas.
- **Home Type / Property Type**: Labeled "Type" or shown near the top. Common MLS values:
  - "Det" or "Detached" → Detached
  - "Semi" or "Semi-Det" or "Semi-Detached" → Semi-Detached  
  - "Att/Row/Twnhs" or "Row" or "Town" or "Link" or "Freehold Townhouse" → Townhouse / Row
  - "Condo Apt" or "Condo Apartment" → Condo
  - "Condo Town" or "Condo Townhome" → Townhouse / Row
  - "Multiplex" → Multi-Unit Residential
  - "Duplex" → Duplex
  - "Triplex" → Triplex
- **Bedrooms**: Labeled "Br" or "Bedrooms". Format "3+1" means 3 full bedrooms + 1 den. Use the TOTAL (e.g. "4" for 3+1).
- **Bathrooms**: Labeled "Bath" or "Washrooms". Format "1x4, 1x3" means one 4-piece bath + one 3-piece bath. Count TOTAL number of bathrooms (e.g. "2").
- **Lot Size**: Labeled "Lot" or "Lot Size" or "Lot Sz". Shows dimensions like "25 x 120 Feet" or area.
- **DOM**: Days on Market — skip this field.

**MID SECTION:**
- **Apx Age / Age**: Labeled "Apx Age" or "Age". Usually a range like "6-15" or "0-5" or "New". Convert to approximate year built:
  - "0-5" → subtract 2 from current year (2026) → "2024"
  - "6-15" → subtract 10 → "2016"  
  - "16-30" → subtract 23 → "2003"
  - "31-50" → subtract 40 → "1986"
  - "51-99" → subtract 75 → "1951"
  - "100+" → "1920"
  - If an exact year is given, use that.
- **Apx Sqft / Size**: Labeled "Apx Sqft" or "Sq Ft" or "Size". Usually a range like "1500-2000". Use the MIDPOINT as a number string (e.g. "1750"). If exact, use exact.
- **Storeys / Style**: Labeled "Style" or near property type. Common values:
  - "2-Storey" or "2 Storey" → "2"
  - "Bungalow" or "1 1/2 Storey" → "1.5"
  - "3-Storey" → "3"
  - "Backsplit" or "Sidesplit" → "2"
  - "Apartment" → "1"
- **Exterior / Construction**: Labeled "Exterior" or near the exterior materials. Map to:
  - "Brick" or "All Brick" or "Brk" → "Brick"
  - "Brick/Stone" or "Brick Veneer" or "BrkVnr" → "Brick Veneer"
  - "Vinyl Sdg" or "Vinyl Siding" or "Frame" → "Frame with Vinyl Siding"
  - "Alum Sdg" or "Aluminum Siding" → "Frame with Aluminum Siding"
  - "Concrete" or "Block" → "Concrete Block"
  - "Stone" → "Stone"
  - "Stucco" → "Stucco"
  - Anything else → "Other"
- **Heat / Heating**: Labeled "Heat" or "Heating". Map to:
  - "Forced Air" + "Gas" or "Gas Forced Air" or "FA Gas" → "Forced Air Gas"
  - "Forced Air" + "Electric" or "FA Elec" → "Forced Air Electric"
  - "Baseboard" or "Baseboard Electric" or "Elec Bsbd" → "Baseboard Electric"
  - "Hot Water" or "Radiator" or "HW Rad" → "Hot Water Radiator"
  - "Radiant" or "In-Floor" → "Radiant In-Floor"
  - "Heat Pump" → "Heat Pump"
  - Anything else → "Other"
- **Roof**: Sometimes labeled "Roof" but NOT always present on MLS sheets. If found, map:
  - "Shingle" or "Asphalt" → "Asphalt Shingle"
  - "Metal" or "Steel" → "Metal"
  - "Flat" or "Tar & Gravel" → "Flat (Modified Bitumen)"
  - "EPDM" or "TPO" → "Flat (EPDM/TPO)"
  - "Cedar" or "Shake" → "Cedar Shake"
  - "Slate" → "Slate"
  - "Tile" or "Clay" → "Tile"
  - If not found at all, use null.
- **Basement**: Labeled "Basement" or "Bsmt". Map to:
  - "Fin" or "Finished" → "Full, Finished"
  - "Unfin" or "Unfinished" → "Full, Unfinished"
  - "Part Fin" or "Part Bsmt" or "Partially Finished" → "Partial, Finished"
  - "Part Unfin" → "Partial, Unfinished"
  - "Crawl" or "Crawl Space" → "Crawl Space"
  - "None" or "N" → "None"
  - If just "Full" with no finish info → "Full, Unfinished"
- **Units**: For multi-unit properties. If not specified, use "1" for single-family homes.
- **Parking / Garage**: Labeled "Gar", "Gar Spcs", "Park/Drive", "Tot Prk Spcs". Note the number but don't map to a specific field.

**BOTTOM SECTION:**
- **Rooms**: Lists each room with level, dimensions, and finishes. Use to confirm bedroom/bathroom counts.
- **Client Remarks / Extras**: Sales pitch text — skip unless it mentions property details not found elsewhere.

## OUTPUT FORMAT

Return ONLY a JSON object with these fields (use null for any you cannot find):
{
  "propertyType": "one of: Detached, Semi-Detached, Townhouse / Row, Multi-Unit Residential, Condo, Apartment, Duplex, Triplex",
  "unitNumber": "unit/suite number as string (e.g. '1122', '204', 'Suite 3B'), or null for houses",
  "yearBuilt": "4-digit year as string",
  "sqft": "number as string, no commas",
  "units": "number as string",
  "storeys": "number as string, e.g. 2 or 1.5",
  "constructionType": "one of: Brick, Brick Veneer, Frame with Vinyl Siding, Frame with Aluminum Siding, Concrete Block, Stone, Stucco, Other",
  "heatingType": "one of: Forced Air Gas, Forced Air Electric, Baseboard Electric, Hot Water Radiator, Radiant In-Floor, Heat Pump, Other",
  "roofType": "one of: Asphalt Shingle, Metal, Flat (Modified Bitumen), Flat (EPDM/TPO), Cedar Shake, Slate, Tile, Other",
  "basement": "one of: Full, Finished / Full, Unfinished / Full, Partially Finished / Partial, Finished / Partial, Unfinished / Crawl Space / None",
  "replacementCost": "estimated replacement cost as string, no commas",
  "listPrice": "listing price as string, no commas",
  "salePrice": "sale price as string, no commas, or null",
  "address": "street address WITHOUT unit number (e.g. '230 King St E, Toronto, ON M5A1K5')",
  "bedrooms": "number as string (total including dens, e.g. 3+1 = 4)",
  "bathrooms": "total count as string",
  "lotSize": "lot dimensions or area as string",
  "confidence": 0.85
}

For replacement cost: if not directly stated, estimate as 60-80% of list price, adjusting up for newer/larger/premium builds and down for older/smaller properties.

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
