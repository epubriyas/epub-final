'use client'
export default function WorkError({ reset }: { reset: () => void }) {
  return (
    <main className="et-container et-content-section">
      <h1>The work collection is temporarily unavailable.</h1>
      <p>Please try again in a moment.</p>
      <button className="et-text-link" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
