import { cleanReviewText } from '../../../utils/reviewUtils'

export function ReviewThread({ 
  review, 
  activeThread, 
  replyDrafts, 
  heartedReplies,
  onToggleThread,
  onReplyDraftChange,
  onReplySubmit,
  onHeartReply,
  isAuthenticated
}) {
  if (activeThread !== review.id) return null

  return (
    <div className="review-thread">
      <div className="thread-replies">
        {review.replies?.length ? (
          review.replies.map((reply) => (
            <div key={reply.id} className="thread-reply">
              <div className="thread-reply-meta">
                <span className="thread-reply-author">{reply.author}</span>
                <span className="thread-reply-time">{reply.timestamp}</span>
              </div>
              <p className="thread-reply-body">{cleanReviewText(reply.body)}</p>
              <div className="thread-reply-actions">
                <button
                  type="button"
                  onClick={() => onHeartReply(review.id, reply.id)}
                  aria-pressed={heartedReplies[reply.id] || false}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {reply.likes || 0}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="thread-empty">No replies yet. Start the conversation.</p>
        )}
      </div>
      {isAuthenticated && (
        <form className="thread-form" onSubmit={(event) => onReplySubmit(event, review.id)}>
          <textarea
            rows={2}
            placeholder="Add a reply"
            value={replyDrafts[review.id] || ''}
            onChange={(event) => onReplyDraftChange(review.id, event.target.value)}
          />
          <button type="submit" disabled={!replyDrafts[review.id]?.trim()}>
            Reply
          </button>
        </form>
      )}
    </div>
  )
}

export function ReviewActions({ 
  review, 
  activeThread, 
  heartedReviews,
  onToggleThread,
  onHeartReview
}) {
  return (
    <div className="review-actions">
      <button
        type="button"
        className="review-action"
        onClick={() => onToggleThread(review.id)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
        </svg>
        {review.replies?.length || 0}
      </button>
      <button
        type="button"
        className="review-action"
        onClick={() => onHeartReview(review.id)}
        aria-pressed={heartedReviews[review.id] || false}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        {review.likes || 0}
      </button>
    </div>
  )
}

