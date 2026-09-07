import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { postRowToPost } from "@/lib/supabase/mappers";
import type { PostRow } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const { data, error } = await getSupabaseServerClient()
    .from("posts")
    .select("*")
    .order("engagement_score", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const posts = ((data ?? []) as PostRow[]).map(postRowToPost);
  return NextResponse.json({ posts });
}
