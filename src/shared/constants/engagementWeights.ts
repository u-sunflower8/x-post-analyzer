/** Minimum posts required in a bucket before it's eligible for "best" rankings, to avoid a single lucky outlier winning. */
export const MIN_BUCKET_SAMPLE_SIZE = 3;

/** Minimum impressions for a post to be considered in AI top/bottom post selection, to filter out low-reach noise. */
export const MIN_IMPRESSIONS_FOR_AI_RANKING = 10;
