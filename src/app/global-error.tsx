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
          maxWidth: '400px',
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
            marginBottom: '24px',
            lineHeight: '1.5',
          }}>
            ページの読み込み中に問題が発生しました。<br />
            ページを再読み込みしてください。
          </p>
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
      </body>
    </html>
  );
}
