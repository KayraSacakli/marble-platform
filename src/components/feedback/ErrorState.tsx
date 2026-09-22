'use client';

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', retry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        maxWidth: 'var(--container-md)',
        margin: '0 auto',
      }}
    >
      <h2 className="text-h3" style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
        Error
      </h2>
      <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: retry ? 'var(--space-5)' : undefined }}>
        {message}
      </p>
      {retry && (
        <button
          onClick={retry}
          type="button"
          className="button button--secondary button--md"
          style={{ marginTop: 'var(--space-4)' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
