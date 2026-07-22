import { Skeleton, SkeletonRectangle } from './primitives';

export function AdminProductEditorSkeleton() {
  return (
    <div className="pe-layout" aria-hidden="true">
      <nav className="pe-sidebar">
        <div className="pe-sidebar-inner">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pe-nav-item">
              <SkeletonRectangle width={20} height={20} />
              <SkeletonRectangle width={80} height={12} />
            </div>
          ))}
        </div>
      </nav>

      <div className="pe-main">
        <div className="pe-form">
          <div id="pe-section-basic" className="pe-section">
            <SkeletonRectangle width={100} height={18} className="mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="admin-field">
                <SkeletonRectangle width={80} height={10} className="mb-1" />
                <SkeletonRectangle width="100%" height={36} />
              </div>
              <div className="admin-field">
                <SkeletonRectangle width={80} height={10} className="mb-1" />
                <SkeletonRectangle width="100%" height={36} />
              </div>
            </div>
            <div className="admin-field mt-4">
              <SkeletonRectangle width={100} height={10} className="mb-1" />
              <SkeletonRectangle width="100%" height={100} />
            </div>
          </div>

          <div id="pe-section-images" className="pe-section mt-6">
            <SkeletonRectangle width={80} height={18} className="mb-4" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-img" style={{ width: 100, height: 100 }} />
              ))}
            </div>
          </div>

          <div id="pe-section-specs" className="pe-section mt-6">
            <SkeletonRectangle width={120} height={18} className="mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="admin-field">
                  <SkeletonRectangle width={80} height={10} className="mb-1" />
                  <SkeletonRectangle width="100%" height={36} />
                </div>
              ))}
            </div>
          </div>

          <div id="pe-section-vendors" className="pe-section mt-6">
            <SkeletonRectangle width={140} height={18} className="mb-4" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="vendor-card mb-3">
                <div className="vendor-card-header">
                  <SkeletonRectangle width={120} height={16} />
                </div>
                <div className="vendor-card-body">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="admin-field">
                      <SkeletonRectangle width={80} height={10} className="mb-1" />
                      <SkeletonRectangle width="100%" height={36} />
                    </div>
                    <div className="admin-field">
                      <SkeletonRectangle width={80} height={10} className="mb-1" />
                      <SkeletonRectangle width="100%" height={36} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
