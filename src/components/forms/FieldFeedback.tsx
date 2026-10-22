export function FieldFeedback({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className="et-field-error et-field-feedback" aria-live="polite">
      {message || ''}
    </p>
  )
}
