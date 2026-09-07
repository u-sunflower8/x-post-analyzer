export interface XPublicMetrics {
  like_count: number;
  retweet_count: number;
  reply_count: number;
  quote_count: number;
  impression_count?: number;
}

export interface XTweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: XPublicMetrics;
}

export interface XUserPublicMetrics {
  followers_count: number;
}

export interface XUser {
  id: string;
  username: string;
  name: string;
  public_metrics?: XUserPublicMetrics;
}

export interface XSearchResponse {
  data?: XTweet[];
  includes?: {
    users?: XUser[];
  };
  meta?: {
    result_count: number;
    next_token?: string;
  };
  errors?: unknown[];
  title?: string;
  detail?: string;
}
