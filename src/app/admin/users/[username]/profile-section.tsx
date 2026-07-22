'use client';

interface Props {
  displayName: string | null;
  profileId: string;
  votes: number;
  collection: number;
  wishlist: number;
}

export function ProfileSection({ displayName, profileId, votes, collection, wishlist }: Props) {
  return (
    <div className="admin-section">
      <div className="admin-section-header">PROFILE</div>
      <div className="admin-section-body">
        <div className="admin-info-row">
          <span className="admin-info-label">Display Name</span>
          <span className="admin-info-value">{displayName || '—'}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">User ID</span>
          <span className="admin-info-value admin-info-mono">{profileId}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">Votes</span>
          <span className="admin-info-value">{votes}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">Collection</span>
          <span className="admin-info-value">{collection}</span>
        </div>
        <div className="admin-info-row">
          <span className="admin-info-label">Wishlist</span>
          <span className="admin-info-value">{wishlist}</span>
        </div>
      </div>
    </div>
  );
}
