interface ProductDescriptionProps {
  description: string | null;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description?.trim()) return null;

  return (
    <p
      style={{
        fontFamily: 'var(--f-m)',
        fontSize: 'clamp(15px, 1.2vw, 16px)',
        lineHeight: 1.75,
        color: '#b8b8b8',
        whiteSpace: 'pre-line',
        maxWidth: 650,
        margin: 'var(--sp-6) 0',
      }}
    >
      {description}
    </p>
  );
}
