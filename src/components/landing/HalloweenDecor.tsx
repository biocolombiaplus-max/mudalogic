type DecorItem = {
  emoji: string;
  className: string;
  style?: React.CSSProperties;
};

export default function HalloweenDecor({ items }: { items: DecorItem[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {items.map((it, i) => (
        <span key={i} className={`absolute ${it.className}`} style={it.style}>
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
