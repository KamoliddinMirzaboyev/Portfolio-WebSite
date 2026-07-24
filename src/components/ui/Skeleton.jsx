import "./Skeleton.css";

export function Skeleton({
  className = "",
  width,
  height,
  circle = false,
  style,
  ...rest
}) {
  return (
    <div
      className={`sk ${circle ? "sk-circle" : ""} ${className}`.trim()}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function PortfolioSkeleton({ count = 3 }) {
  return (
    <div className="sk-portfolio-grid" aria-busy="true" aria-label="Yuklanmoqda">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sk-portfolio-card" key={i}>
          <Skeleton className="sk-portfolio-media sk-block" />
          <div className="sk-portfolio-body">
            <Skeleton className="sk-line lg" width="55%" />
            <Skeleton className="sk-line" width="90%" />
            <Skeleton className="sk-line sm" width="70%" />
            <div className="sk-chips">
              <Skeleton className="sk-chip" />
              <Skeleton className="sk-chip" />
              <Skeleton className="sk-chip" />
            </div>
            <div className="sk-chips" style={{ marginTop: 8 }}>
              <Skeleton className="sk-chip" width={72} />
              <Skeleton className="sk-chip" width={48} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogSkeleton({ count = 3 }) {
  return (
    <div className="sk-blog-grid" aria-busy="true" aria-label="Yuklanmoqda">
      {Array.from({ length: count }).map((_, i) => (
        <div className="sk-blog-card" key={i}>
          <Skeleton className="sk-blog-media sk-block" />
          <div className="sk-blog-body">
            <Skeleton className="sk-line sm" width="30%" />
            <Skeleton className="sk-line lg" width="75%" />
            <Skeleton className="sk-line" width="95%" />
            <Skeleton className="sk-line sm" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="sk-detail" aria-busy="true" aria-label="Yuklanmoqda">
      <Skeleton className="sk-line sm" width={120} />
      <Skeleton className="sk-detail-title" />
      <Skeleton className="sk-line" width="45%" />
      <Skeleton className="sk-detail-hero sk-block" />
      <div className="sk-detail-lines">
        <Skeleton className="sk-line" width="100%" />
        <Skeleton className="sk-line" width="96%" />
        <Skeleton className="sk-line" width="88%" />
        <Skeleton className="sk-line" width="70%" />
      </div>
      <div className="sk-chips">
        <Skeleton className="sk-chip" width={64} />
        <Skeleton className="sk-chip" width={72} />
        <Skeleton className="sk-chip" width={56} />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yuklanmoqda">
      <div className="sk-admin-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="sk-admin-stat sk-block" />
        ))}
      </div>
      <div className="admin-dash-grid">
        <div className="admin-card">
          <Skeleton className="sk-line lg" width="40%" style={{ marginBottom: 14 }} />
          <div className="sk-chips">
            <Skeleton className="sk-chip" width={88} height={34} />
            <Skeleton className="sk-chip" width={88} height={34} />
            <Skeleton className="sk-chip" width={88} height={34} />
          </div>
        </div>
        <div className="admin-card">
          <Skeleton className="sk-line lg" width="50%" style={{ marginBottom: 14 }} />
          <div className="sk-admin-list">
            <Skeleton className="sk-admin-row" />
            <Skeleton className="sk-admin-row" />
            <Skeleton className="sk-admin-row" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminListSkeleton({ count = 4 }) {
  return (
    <div className="sk-admin-list" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="sk-admin-row" />
      ))}
    </div>
  );
}

export function AdminFormSkeleton() {
  return (
    <div className="sk-admin-form" aria-busy="true">
      <Skeleton className="sk-admin-field" width="40%" />
      <Skeleton className="sk-admin-field" />
      <Skeleton className="sk-admin-field" />
      <Skeleton className="sk-admin-field tall" />
      <Skeleton className="sk-admin-field" width="30%" height={36} />
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="sk-auth" aria-busy="true">
      <Skeleton className="sk-auth-logo" />
      <Skeleton className="sk-auth-title" />
      <Skeleton className="sk-line sm" width="60%" />
      <Skeleton className="sk-admin-field" />
      <Skeleton className="sk-admin-field" />
      <Skeleton className="sk-admin-field" height={40} />
    </div>
  );
}

export default Skeleton;
