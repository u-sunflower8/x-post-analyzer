import { NextResponse } from "next/server";
import { listPosts } from "@/lib/db/queries";
import { postRowToPost } from "@/lib/db/mappers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const rows = await listPosts(limit);
  return NextResponse.json({ posts: rows.map(postRowToPost) });
}
