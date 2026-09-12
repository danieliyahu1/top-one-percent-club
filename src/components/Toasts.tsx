interface Toast {
  id: number;
  text: string;
}

interface ToastsProps {
  toasts: Toast[];
}

export default function Toasts({ toasts }: ToastsProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.text}
        </div>
      ))}
    </div>
  );
}