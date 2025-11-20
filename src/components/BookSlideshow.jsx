import React, { useState, useEffect, useRef } from 'react'
import './BookSlideshow.css'

function BookSlideshow({ books }) {
  // start from middle view
  const [currentIndex, setCurrentIndex] = useState(books.length || 0)
  const [isPaused, setIsPaused] = useState(false)
  const slideshowRef = useRef(null)
  const intervalRef = useRef(null)
  const prevIndexRef = useRef(books.length || 0)

  const cardWidth = 280 // width of each card
  const gap = 20 // gap between cards
  const totalWidth = cardWidth + gap
  const cardsPerView = 3 // number of cards visible at once

  // duplicate books for infinite loop effect
  const duplicatedBooks = [...books, ...books, ...books]

  useEffect(() => {
    if (books.length === 0 || isPaused) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        // continue forward continuously - never reset
        return prev + 1
      })
    }, 2000) // rotate every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [books.length, isPaused])

  useEffect(() => {
    if (!slideshowRef.current) return

    const prevIndex = prevIndexRef.current
    prevIndexRef.current = currentIndex

    // calculate position in the duplicated array
    const positionInDuplicated = currentIndex % duplicatedBooks.length
    
    // check if we need to jump to keep us in the middle set for seamless loop
    const isInMiddleSet = positionInDuplicated >= books.length && positionInDuplicated < books.length * 2
    const prevPosition = prevIndex % duplicatedBooks.length
    const wasInMiddleSet = prevPosition >= books.length && prevPosition < books.length * 2

    // if we're leaving the middle set, jump seamlessly to equivalent position in middle set
    if (!isInMiddleSet && wasInMiddleSet) {
      // calculate equivalent position in middle set
      const bookIndex = positionInDuplicated % books.length
      const equivalentIndex = bookIndex + books.length
      
      // calculate transform for centering
      const viewportCenterOffset = totalWidth // Offset to center the current card
      const equivalentTranslateX = -(equivalentIndex * totalWidth) + viewportCenterOffset
      
      // seamless jump: disable transition, jump to equivalent position, re-enable
      slideshowRef.current.style.transition = 'none'
      slideshowRef.current.style.transform = `translateX(${equivalentTranslateX}px)`
      
      // update currentIndex to the equivalent position in middle set
      setCurrentIndex(equivalentIndex)
      
      requestAnimationFrame(() => {
        if (slideshowRef.current) {
          slideshowRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      })
      return
    }

    // positions: [prev] [current (center)] [next] for center current card
    const viewportCenterOffset = totalWidth // offset to center the middle card
    const translateX = -(positionInDuplicated * totalWidth) + viewportCenterOffset
    slideshowRef.current.style.transform = `translateX(${translateX}px)`
  }, [currentIndex, totalWidth, books.length, duplicatedBooks.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => prev - 1)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }

  if (books.length === 0) return null

  return (
    <div className="book-slideshow-container">
      <button className="slideshow-arrow slideshow-arrow-left" onClick={handlePrev}>
        ‹
      </button>
      <div className="slideshow-viewport">
        <div className="slideshow-track" ref={slideshowRef}>
          {duplicatedBooks.map((book, index) => {
            // calculate position in duplicated array for current card
            const currentPosition = currentIndex % duplicatedBooks.length
            
            // only the card at the exact currentIndex position should be active (center card)
            const isActive = index === currentPosition
            
            // cards in viewport: show one before, center (active), and one after
            // calculate distance considering the loop
            let distanceFromCenter = Math.abs(index - currentPosition)
            // handle wrap-around distance
            if (distanceFromCenter > duplicatedBooks.length / 2) {
              distanceFromCenter = duplicatedBooks.length - distanceFromCenter
            }
            const isInViewport = distanceFromCenter <= 1
            
            return (
            <div 
              key={`${book.isbn}-${index}`} 
              className={`slideshow-book-card ${isActive ? 'active' : ''}`}
              style={{
                opacity: isInViewport ? (isActive ? 1 : 0.6) : 0.3,
                transform: isActive ? 'scale(1)' : `scale(${Math.max(0.85, 0.95 - distanceFromCenter * 0.1)})`
              }}
            >
              <div className="book-card-header">
                <h3 className="book-card-title">{book.title}</h3>
                <div className="book-rating">
                  <span className="rating-number">{book.rating.toFixed(1)} / 5</span>
                </div>
              </div>
              <div className="book-card-body">
                <p className="book-card-author">by {book.author}</p>
                <p className="book-card-date">
                  Released: {new Date(book.releaseDate).toLocaleDateString()}
                </p>
                <p className="book-card-isbn">ISBN: {book.isbn}</p>
                <span className="book-card-genre">{book.genre}</span>
              </div>
            </div>
            )
          })}
        </div>
      </div>
      <button className="slideshow-arrow slideshow-arrow-right" onClick={handleNext}>
        ›
      </button>
    </div>
  )
}

export default BookSlideshow

