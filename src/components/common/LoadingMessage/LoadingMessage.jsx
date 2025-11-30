/**
 * Reusable loading message component
 */
export default function LoadingMessage({ message = 'Loading...', className = '' }) {
  return (
    <div className={className || 'loading-container'}>
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--white)' }}>
        <p>{message}</p>
      </div>
    </div>
  )
}

