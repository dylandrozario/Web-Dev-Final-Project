import { cleanReviewText } from '../../../utils/reviewUtils';

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export function ReviewThread({ 
  review, 
  activeThread, 
  replyDrafts,
  replyEditDrafts = {},
  editingReplyId = null,
  heartedReplies,
  onReplyDraftChange,
  onReplyEditDraftChange,
  onReplySubmit,
  onEditReply,
  onUpdateReply,
  onCancelEditReply,
  onDeleteReply,
  onHeartReply,
  isAuthenticated,
  user
}) {
  if (activeThread !== review.id) return null;

  const isReplyOwner = (reply) => {
    if (!isAuthenticated || !user) return false;
    const userId = user.uid || user.email;
    const userName = user.name || user.email?.split('@')[0] || 'You';
    return reply.userId === userId || reply.author === userName || reply.author === 'You';
  };

  return (
    <div className="review-thread">
      <div className="thread-replies">
        {review.replies?.length ? (
          review.replies.map((reply) => {
            const isEditing = editingReplyId === reply.id;
            const isOwner = isReplyOwner(reply);
            const draftText = replyEditDrafts[reply.id] || '';

            return (
              <div key={reply.id} className="thread-reply">
                <div className="thread-reply-meta">
                  <span className="thread-reply-author">{reply.author}</span>
                  <span className="thread-reply-time">{reply.timestamp}</span>
                </div>
                {isEditing ? (
                  <form 
                    className="thread-reply-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onUpdateReply(review.id, reply.id);
                    }}
                  >
                    <textarea
                      rows={2}
                      value={draftText}
                      onChange={(e) => onReplyEditDraftChange(reply.id, e.target.value)}
                    />
                    <div className="thread-reply-edit-actions">
                      <button type="submit" disabled={!draftText.trim()}>
                        Save
                      </button>
                      <button type="button" onClick={onCancelEditReply}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="thread-reply-body">{cleanReviewText(reply.body)}</p>
                    <div className="thread-reply-actions">
                      <button
                        type="button"
                        onClick={() => onHeartReply(review.id, reply.id)}
                        aria-pressed={heartedReplies[reply.id] || false}
                      >
                        <HeartIcon />
                        {reply.likes || 0}
                      </button>
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditReply(review.id, reply.id)}
                            className="thread-reply-edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteReply(review.id, reply.id)}
                            className="thread-reply-delete-btn"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
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
  );
}

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
  </svg>
);

const HeartIconLarge = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export function ReviewActions({ 
  review, 
  onToggleThread,
  onHeartReview,
  heartedReviews
}) {
  return (
    <div className="review-actions">
      <button
        type="button"
        className="review-action"
        onClick={() => onToggleThread(review.id)}
      >
        <CommentIcon />
        {review.replies?.length || 0}
      </button>
      <button
        type="button"
        className="review-action"
        onClick={() => onHeartReview(review.id)}
        aria-pressed={heartedReviews[review.id] || false}
      >
        <HeartIconLarge />
        {review.likes || 0}
      </button>
    </div>
  );
}

