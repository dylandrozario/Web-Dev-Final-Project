import { useState, useCallback } from 'react';
import { toRelativeTime } from '../utils/bookUtils';
import { saveReviewToStorage, loadHeartedReviews, saveHeartedReviews, loadHeartedReplies, saveHeartedReplies } from '../utils/reviewUtils';

const updateReviewAndSave = (setReviews, bookIsbn, reviewId, updater) => {
  setReviews(prev => {
    const updated = prev.map(review => 
      review.id === reviewId ? updater(review) : review
    );
    const updatedReview = updated.find(r => r.id === reviewId);
    if (updatedReview && bookIsbn) {
      saveReviewToStorage(updatedReview, bookIsbn);
    }
    return updated;
  });
};

export function useReviewInteractions(reviews, setReviews, bookIsbn, isAuthenticated, user) {
  const [activeThread, setActiveThread] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyEditDrafts, setReplyEditDrafts] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [heartedReviews, setHeartedReviews] = useState(() => loadHeartedReviews());
  const [heartedReplies, setHeartedReplies] = useState(() => loadHeartedReplies());

  const handleToggleThread = useCallback((reviewId) => {
    setActiveThread(prev => (prev === reviewId ? null : reviewId));
  }, []);

  const handleReplyDraftChange = useCallback((reviewId, text) => {
    setReplyDrafts(prev => ({ ...prev, [reviewId]: text }));
  }, []);

  const handleReplySubmit = useCallback((event, reviewId) => {
    event.preventDefault();
    const text = replyDrafts[reviewId]?.trim();
    if (!text) return;

    const userId = isAuthenticated && user ? (user.uid || user.email) : null;
    const authorName = isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader';

    const reply = {
      id: `${reviewId}-reply-${Date.now()}`,
      userId,
      author: authorName,
      body: text,
      timestamp: toRelativeTime(new Date().toISOString()),
      likes: 0
    };

    updateReviewAndSave(setReviews, bookIsbn, reviewId, review => ({
      ...review,
      replies: [...(review.replies || []), reply]
    }));
    
    setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }));
  }, [replyDrafts, isAuthenticated, user, setReviews, bookIsbn]);

  const handleEditReply = useCallback((reviewId, replyId) => {
    const review = reviews.find(r => r.id === reviewId);
    const reply = review?.replies?.find(r => r.id === replyId);
    if (!reply) return;

    setEditingReplyId(replyId);
    setReplyEditDrafts(prev => ({ ...prev, [replyId]: reply.body }));
  }, [reviews]);

  const handleCancelEditReply = useCallback(() => {
    setEditingReplyId(prev => {
      if (prev) {
        setReplyEditDrafts(drafts => {
          const newDrafts = { ...drafts };
          delete newDrafts[prev];
          return newDrafts;
        });
      }
      return null;
    });
  }, []);

  const handleUpdateReply = useCallback((reviewId, replyId) => {
    const text = replyEditDrafts[replyId]?.trim();
    if (!text) return;

    updateReviewAndSave(setReviews, bookIsbn, reviewId, review => ({
      ...review,
      replies: review.replies.map(reply =>
        reply.id === replyId
          ? { ...reply, body: text, timestamp: toRelativeTime(new Date().toISOString()) }
          : reply
      )
    }));
    
    setEditingReplyId(null);
    setReplyEditDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[replyId];
      return newDrafts;
    });
  }, [replyEditDrafts, setReviews, bookIsbn]);

  const handleDeleteReply = useCallback((reviewId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    updateReviewAndSave(setReviews, bookIsbn, reviewId, review => ({
      ...review,
      replies: review.replies.filter(reply => reply.id !== replyId)
    }));
  }, [setReviews, bookIsbn]);

  const handleHeartReview = useCallback((reviewId) => {
    const alreadyHearted = heartedReviews[reviewId];
    const updatedHearted = { ...heartedReviews, [reviewId]: !alreadyHearted };
    
    updateReviewAndSave(setReviews, bookIsbn, reviewId, review => ({
      ...review,
      likes: Math.max(0, (review.likes || 0) + (alreadyHearted ? -1 : 1))
    }));
    
    setHeartedReviews(updatedHearted);
    saveHeartedReviews(updatedHearted);
  }, [heartedReviews, setReviews, bookIsbn]);

  const handleHeartReply = useCallback((reviewId, replyId) => {
    const alreadyHearted = heartedReplies[replyId];
    const updatedHearted = { ...heartedReplies, [replyId]: !alreadyHearted };
    
    updateReviewAndSave(setReviews, bookIsbn, reviewId, review => ({
      ...review,
      replies: review.replies.map(reply =>
        reply.id === replyId
          ? { ...reply, likes: Math.max(0, (reply.likes || 0) + (alreadyHearted ? -1 : 1)) }
          : reply
      )
    }));
    
    setHeartedReplies(updatedHearted);
    saveHeartedReplies(updatedHearted);
  }, [heartedReplies, setReviews, bookIsbn]);

  const handleReplyEditDraftChange = useCallback((replyId, text) => {
    setReplyEditDrafts(prev => ({ ...prev, [replyId]: text }));
  }, []);

  return {
    activeThread,
    replyDrafts,
    replyEditDrafts,
    editingReplyId,
    heartedReviews,
    heartedReplies,
    handleToggleThread,
    handleReplyDraftChange,
    handleReplyEditDraftChange,
    handleReplySubmit,
    handleEditReply,
    handleUpdateReply,
    handleCancelEditReply,
    handleDeleteReply,
    handleHeartReview,
    handleHeartReply
  };
}

