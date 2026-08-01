const PREFIX = 'x-post-analyzer:v1';

export const STORAGE_KEYS = {
  posts: `${PREFIX}:posts`,
  uploadMeta: `${PREFIX}:upload-meta`,
  aiAnalysis: `${PREFIX}:ai-analysis`,
  postSuggestions: `${PREFIX}:post-suggestions`,
  postDrafts: `${PREFIX}:post-drafts`,
  theme: `${PREFIX}:theme`,
} as const;
