import type { SearchParams } from "@/types/post";
import { buildSearchQuery } from "./query";
import type { XSearchResponse } from "./types";

const X_API_BASE = "https://api.x.com/2";

export class XApiNotConfiguredError extends Error {
  constructor() {
    super("X_BEARER_TOKENが未設定です。X APIを利用するにはdeveloper.x.comでのプラン登録とBearer Tokenの設定が必要です。");
    this.name = "XApiNotConfiguredError";
  }
}

export function getBearerToken(): string {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new XApiNotConfiguredError();
  return token;
}

export async function searchRecentTweets(params: SearchParams): Promise<XSearchResponse> {
  const query = buildSearchQuery(params);
  const maxResults = Math.min(Math.max(params.maxResults ?? 20, 10), 100);

  const searchParams = new URLSearchParams({
    query,
    max_results: String(maxResults),
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "username,name,public_metrics",
  });

  if (params.startTime) searchParams.set("start_time", params.startTime);
  if (params.endTime) searchParams.set("end_time", params.endTime);

  const res = await fetch(`${X_API_BASE}/tweets/search/recent?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${getBearerToken()}` },
    cache: "no-store",
  });

  const body = (await res.json()) as XSearchResponse;

  if (!res.ok) {
    throw new Error(body.detail ?? body.title ?? `X API request failed with status ${res.status}`);
  }

  return body;
}
