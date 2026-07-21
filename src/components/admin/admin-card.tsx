export function Card({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="bc">
      <div className="bc-h">{t}</div>
      <div className="bc-b">{children}</div>
    </div>
  );
}
