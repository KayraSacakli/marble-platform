'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--space-8) var(--grid-margin)',
        textAlign: 'center',
      }}
    >
      <h1 className="text-h2" style={{ marginBottom: 'var(--space-4)' }}>
        Something went wrong
      </h1>
      <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '40ch' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        type="button"
        className="button button--primary button--md"
      >
        Try again
      </button>
    </div>
  );
}
