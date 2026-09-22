export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ padding: '48px 24px', textAlign: 'center' }}>
      <p>Loading...</p>
    </div>
  );
}
