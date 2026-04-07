'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body style={{
        margin: 0,
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: '#FDFBF7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>📖</div>
          <h2 style={{
            color: '#78350f',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>エラーが発生しました</h2>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: '1.5',
          }}>
            ページの読み込み中に問題が発生しました。
          </p>
          {/* Show error details for debugging */}
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
              marginRight: '8px',
            }}
          >
            再読み込み
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            フルリロード
          </button>
        </div>
      </body>
    </html>
  );
}
