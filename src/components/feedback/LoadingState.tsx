interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        maxWidth: 'var(--container-md)',
        margin: '0 auto',
      }}
    >
      <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
    </div>
  );
}
