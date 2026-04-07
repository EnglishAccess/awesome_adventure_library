'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      textAlign: 'center',
      maxWidth: '500px',
      margin: '40px auto',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
      }}>⚠️</div>
      <h2 style={{
        color: '#78350f',
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '8px',
      }}>ページエラー</h2>
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '24px',
        textAlign: 'left',
        fontSize: '12px',
        color: '#92400e',
        wordBreak: 'break-all',
        maxHeight: '200px',
        overflow: 'auto',
      }}>
        <strong>Error:</strong> {error?.message || 'Unknown error'}<br />
        <strong>Name:</strong> {error?.name || 'N/A'}<br />
        {error?.digest && <><strong>Digest:</strong> {error.digest}<br /></>}
        {error?.stack && (
          <>
            <strong>Stack:</strong><br />
            <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap', margin: '4px 0 0 0' }}>
              {error.stack.substring(0, 500)}
            </pre>
          </>
        )}
      </div>
      <button
        onClick={() => reset()}
        style={{
          backgroundColor: '#d97706',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        再読み込み
      </button>
    </div>
  );
}
