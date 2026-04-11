import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    // Verify authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { unmappedColumns } = await request.json();
    // unmappedColumns: Array of { header: string, sampleValues: string[] }

    if (!unmappedColumns || unmappedColumns.length === 0) {
      return NextResponse.json({ mappings: {} });
    }

    // Fetch the full field registry
    const serviceClient = getServiceClient();
    const { data: fields } = await serviceClient
      .from("field_registry")
      .select("key, label, category, data_type");

    if (!fields) {
      return NextResponse.json({ mappings: {} });
    }

    const fieldList = fields
      .map((f) => `- ${f.key}: ${f.label} (${f.category}, ${f.data_type})`)
      .join("\n");

    const columnsDescription = unmappedColumns
      .map(
        (col: { header: string; sampleValues: string[]; currentMapping?: string }) =>
          `Column: "${col.header}"${col.currentMapping && col.currentMapping !== "skip" ? ` (currently mapped to: ${col.currentMapping})` : " (UNMAPPED)"}\nSample values: ${col.sampleValues.slice(0, 8).map((v: string) => `"${v}"`).join(", ")}`
      )
      .join("\n\n");

    const anthropic = new Anthropic();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-20250414",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a data column mapper for a Jewish community engagement database. You must determine which field in our registry each spreadsheet column maps to.

CRITICAL RULES:
1. Look at BOTH the column header AND the sample values to determine the field type.
2. If the header is empty, missing, or generic (like "__EMPTY", "Column1", "Field1"), you MUST use the sample values to determine the type. For example, if values look like email addresses (contain @), map to "email".
3. Use contextual understanding: "Kid 1" with name values = child_1_name. "Second Kid" with name values = child_2_name. "Family Attending" with numbers = family_members_attending.
4. For child-related columns: "Kid 1", "Child 1", "First child" with name values → child_1_name. "Kid 2", "Second Kid", "Child 2" with name values → child_2_name. Similarly for DOBs.
5. Numbers like "1", "2", "first", "second" in column names indicate which child (1st, 2nd, etc.).
6. If sample values contain Jewish denominations (Reform, Conservative, Orthodox, etc.), map to "denomination".
7. Some columns may already have a mapping from regex matching. If the current mapping is WRONG, override it with the correct one. For example, "Second kid DOB" currently mapped to "date_of_birth" should be corrected to "child_2_dob".

Available fields in the registry:
${fieldList}

You can also suggest "skip" if a column truly doesn't match any field, or "new_field" if it represents a genuinely new concept not in the registry. If suggesting "new_field", also provide a suggested key, label, and category.

Columns to map:
${columnsDescription}

Respond with ONLY a JSON object mapping each column header to its field key. For new fields, use the format: {"header": {"action": "new_field", "key": "suggested_key", "label": "Suggested Label", "category": "category_name"}}. For existing matches: {"header": "field_key"}. For skips: {"header": "skip"}.

JSON response:`,
        },
      ],
    });

    // Parse the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let mappings: Record<string, unknown> = {};
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mappings = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI response:", responseText);
    }

    return NextResponse.json({ mappings });
  } catch (err) {
    console.error("Column detection error:", err);
    return NextResponse.json(
      { error: "Failed to detect columns" },
      { status: 500 }
    );
  }
}
