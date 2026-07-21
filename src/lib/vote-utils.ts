export interface VoteStats {
  upvotes: number;
  downvotes: number;
  total: number;
  approval: number | null;
}

export function computeVoteStats(votes: { type: string }[]): VoteStats {
  const upvotes = votes.filter((v) => v.type === 'upvote').length;
  const downvotes = votes.filter((v) => v.type === 'downvote').length;
  const total = upvotes + downvotes;
  const approval = total >= 10 ? Math.round((upvotes / total) * 100) : null;
  return { upvotes, downvotes, total, approval };
}

export function getCommunityBadge(upvotes: number, approval: number | null): { label: string; cls: string } | null {
  if (approval === null || upvotes < 10) return null;
  if (approval > 90 && upvotes >= 100) return { label: 'HIGHLY RECOMMENDED', cls: 'b-green' };
  if (approval > 80) return { label: 'COMMUNITY FAVORITE', cls: 'b-blue' };
  return null;
}
