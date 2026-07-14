import type { SpecificationWithField } from '@/types';

interface SpecTableProps {
  specifications: SpecificationWithField[];
}

export function SpecTable({ specifications }: SpecTableProps) {
  if (specifications.length === 0) {
    return (
      <div className="spec-empty">
        No specifications available.
      </div>
    );
  }

  const grouped: Record<string, SpecificationWithField[]> = {};
  for (const spec of specifications) {
    const group = spec.specField.group || 'General';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(spec);
  }

  for (const group of Object.keys(grouped)) {
    grouped[group].sort((a, b) => a.specField.order - b.specField.order);
  }

  const groupOrder = Object.keys(grouped);

  return (
    <div className="spec-groups">
      {groupOrder.map((group) => (
        <div key={group} className="spec-group">
          <div className="spec-group-header">
            <h3 className="spec-group-title">{group}</h3>
          </div>
          <div className="spec-group-body">
            {grouped[group].map((spec) => (
              <div key={spec.specField.slug} className="spec-row">
                <span className="spec-label">{spec.specField.name}</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
