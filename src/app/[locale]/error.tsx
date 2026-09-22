'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div role="alert" aria-live="assertive" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        type="button"
        style={{
          padding: '8px 24px',
          fontSize: '14px',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '4px',
          background: '#fff',
        }}
      >
        Try again
      </button>
    </div>
  );
}
