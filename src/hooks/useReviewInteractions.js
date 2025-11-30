import { useState, useCallback } from 'react'
import { toRelativeTime } from '../utils/bookUtils'
import { saveReviewToStorage, loadHeartedReviews, saveHeartedReviews, loadHeartedReplies, saveHeartedReplies } from '../utils/reviewUtils'

export function useReviewInteractions(reviews, setReviews, bookIsbn, isAuthenticated, user) {
  const [activeThread, setActiveThread] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyEditDrafts, setReplyEditDrafts] = useState({})
  const [editingReplyId, setEditingReplyId] = useState(null)
  const [heartedReviews, setHeartedReviews] = useState(() => loadHeartedReviews())
  const [heartedReplies, setHeartedReplies] = useState(() => loadHeartedReplies())

  const handleToggleThread = useCallback((reviewId) => {
    setActiveThread(prev => (prev === reviewId ? null : reviewId))
  }, [])

  const handleReplyDraftChange = useCallback((reviewId, text) => {
    setReplyDrafts(prev => ({ ...prev, [reviewId]: text }))
  }, [])

  const handleReplySubmit = useCallback((event, reviewId) => {
    event.preventDefault()
    const text = replyDrafts[reviewId]?.trim()
    if (!text) return

    const userId = isAuthenticated && user ? (user.uid || user.email) : null
    const authorName = isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'You') : 'Reader'

    const reply = {
      id: `${reviewId}-reply-${Date.now()}`,
      userId: userId,
      author: authorName,
      body: text,
      timestamp: toRelativeTime(new Date().toISOString()),
      likes: 0
    }

    setReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? { ...review, replies: [...(review.replies || []), reply] }
          : review
      )
      
      const reviewWithReply = updated.find(r => r.id === reviewId)
      if (reviewWithReply && bookIsbn) {
        saveReviewToStorage(reviewWithReply, bookIsbn)
      }
      
      return updated
    })
    setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }))
  }, [replyDrafts, isAuthenticated, user, setReviews, bookIsbn])

  const handleEditReply = useCallback((reviewId, replyId) => {
    const review = reviews.find(r => r.id === reviewId)
    const reply = review?.replies?.find(r => r.id === replyId)
    if (!reply) return

    setEditingReplyId(replyId)
    setReplyEditDrafts(prev => ({ ...prev, [replyId]: reply.body }))
  }, [reviews])

  const handleCancelEditReply = useCallback(() => {
    setEditingReplyId(null)
    setReplyEditDrafts(prev => {
      const newDrafts = { ...prev }
      if (editingReplyId) {
        delete newDrafts[editingReplyId]
      }
      return newDrafts
    })
  }, [editingReplyId])

  const handleUpdateReply = useCallback((reviewId, replyId) => {
    const text = replyEditDrafts[replyId]?.trim()
    if (!text) return

    setReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map(reply =>
                reply.id === replyId
                  ? {
                      ...reply,
                      body: text,
                      timestamp: toRelativeTime(new Date().toISOString())
                    }
                  : reply
              )
            }
          : review
      )
      
      const reviewWithUpdatedReply = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedReply && bookIsbn) {
        saveReviewToStorage(reviewWithUpdatedReply, bookIsbn)
      }
      
      return updated
    })
    
    setEditingReplyId(null)
    setReplyEditDrafts(prev => {
      const newDrafts = { ...prev }
      delete newDrafts[replyId]
      return newDrafts
    })
  }, [replyEditDrafts, setReviews, bookIsbn])

  const handleDeleteReply = useCallback((reviewId, replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return

    setReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.filter(reply => reply.id !== replyId)
            }
          : review
      )
      
      const reviewWithDeletedReply = updated.find(r => r.id === reviewId)
      if (reviewWithDeletedReply && bookIsbn) {
        saveReviewToStorage(reviewWithDeletedReply, bookIsbn)
      }
      
      return updated
    })
  }, [setReviews, bookIsbn])

  const handleHeartReview = useCallback((reviewId) => {
    const alreadyHearted = heartedReviews[reviewId]
    const updatedHearted = { ...heartedReviews, [reviewId]: !alreadyHearted }
    
    setReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              likes: Math.max(0, (review.likes || 0) + (alreadyHearted ? -1 : 1))
            }
          : review
      )
      
      const reviewWithUpdatedLikes = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedLikes && bookIsbn) {
        saveReviewToStorage(reviewWithUpdatedLikes, bookIsbn)
      }
      
      return updated
    })
    
    setHeartedReviews(updatedHearted)
    saveHeartedReviews(updatedHearted)
  }, [heartedReviews, setReviews, bookIsbn])

  const handleHeartReply = useCallback((reviewId, replyId) => {
    const alreadyHearted = heartedReplies[replyId]
    const updatedHearted = { ...heartedReplies, [replyId]: !alreadyHearted }
    
    setReviews(prev => {
      const updated = prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              replies: review.replies.map(reply =>
                reply.id === replyId
                  ? {
                      ...reply,
                      likes: Math.max(0, (reply.likes || 0) + (alreadyHearted ? -1 : 1))
                    }
                  : reply
              )
            }
          : review
      )
      
      const reviewWithUpdatedReply = updated.find(r => r.id === reviewId)
      if (reviewWithUpdatedReply && bookIsbn) {
        saveReviewToStorage(reviewWithUpdatedReply, bookIsbn)
      }
      
      return updated
    })
    
    setHeartedReplies(updatedHearted)
    saveHeartedReplies(updatedHearted)
  }, [heartedReplies, setReviews, bookIsbn])

  const handleReplyEditDraftChange = useCallback((replyId, text) => {
    setReplyEditDrafts(prev => ({ ...prev, [replyId]: text }))
  }, [])

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
  }
}

