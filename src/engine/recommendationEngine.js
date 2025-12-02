import shuffleArray from '../utils/shuffle';

/**
 * Calculate similarity between a candidate book and user's saved/favorited/rated books
 * Focuses primarily on genre matching, with author as secondary factor
 * Returns both score and recommendation reasons
 */
export function calculateSimilarity(userBooks, candidateBook) {
  // STRICT: Only use user's actual library data
  if (!userBooks || userBooks.length === 0) return { score: 0, reasons: [] };
  if (!candidateBook || !candidateBook.isbn) return { score: 0, reasons: [] };

  // First, validate and filter userBooks to only include books with valid interactions
  const validUserBooks = userBooks.filter(book => {
    if (!book || !book.isbn) return false;
    const isSaved = book.saved === true;
    const isFavorite = book.favorite === true;
    const isRated = book.rated === true && book.rating !== undefined && book.rating !== null && book.rating > 0;
    const isReviewed = book.reviewed === true && book.review && book.review.trim().length > 0;
    return isSaved || isFavorite || isRated || isReviewed;
  });
  
  // If no valid user books after filtering, return no score
  if (validUserBooks.length === 0) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons = [];
  const genreMatches = new Set();
  const authorMatches = new Set();
  
  // Track which genres actually exist in user's valid library
  const userGenres = new Set();
  validUserBooks.forEach(book => {
    if (book.genre) {
      userGenres.add(book.genre.toLowerCase().trim());
    }
  });

  // Only process valid user books (already filtered above)
  validUserBooks.forEach(userBook => {
    if (!userBook || !userBook.isbn) return;
    
    // Use the specific flags for weight calculation
    const isSaved = userBook.saved === true;
    const isFavorite = userBook.favorite === true;
    const isRated = userBook.rated === true && userBook.rating !== undefined && userBook.rating !== null && userBook.rating > 0;
    const isReviewed = userBook.reviewed === true && userBook.review && userBook.review.trim().length > 0;
    const hasRating = isRated;
    const hasReview = isReviewed;

    // Calculate base weight multiplier based on user engagement
    // Reviews indicate stronger engagement, so weight them higher
    let weightMultiplier = 1.0;
    if (hasReview) {
      // Books with reviews get 2x weight (stronger signal)
      weightMultiplier = 2.0;
    } else if (hasRating && userBook.rating) {
      // Use actual rating value to weight (normalized to 0.3-2.5 range)
      // Rating 1 = 0.3x, Rating 2 = 0.8x, Rating 3 = 1.3x, Rating 4 = 1.8x, Rating 5 = 2.5x
      weightMultiplier = Math.max(0.3, (userBook.rating - 2.0) * 0.5 + 1.0);
    } else if (userBook.favorite) {
      // Favorites get 1.5x weight
      weightMultiplier = 1.5;
    } else if (userBook.saved) {
      // Saved books get base weight
      weightMultiplier = 1.0;
    }

    // Same genre - give higher weight (2 points base) since this is the primary focus
    // Use case-insensitive comparison since genres might be stored in different cases
    // STRICT: Only match if userBook actually has a genre and it matches
    const userGenre = userBook.genre ? userBook.genre.toLowerCase().trim() : null;
    const candidateGenre = candidateBook.genre ? candidateBook.genre.toLowerCase().trim() : null;
    
    // Only add genre match if:
    // 1. User book has a genre
    // 2. Candidate book has a genre
    // 3. They match exactly
    // 4. User book has valid interaction (already checked above)
    // 5. This genre actually exists in the user's valid library
    if (userGenre && candidateGenre && userGenre === candidateGenre && userGenre.length > 0) {
      // STRICT: Only add reason if this genre is actually in the user's library
      if (userGenres.has(userGenre)) {
        const genreScore = 2 * weightMultiplier;
        score += genreScore;
        if (!genreMatches.has(candidateGenre)) {
          genreMatches.add(candidateGenre);
          const reviewNote = hasReview ? ' (reviewed)' : '';
          reasons.push({
            type: 'genre',
            value: candidateBook.genre, // Use original case for display
            message: `Similar to your ${candidateBook.genre} books${reviewNote}`
          });
        }
      }
    }

    // Same author - secondary factor (1 point base)
    // Use case-insensitive comparison for author names
    const userAuthor = userBook.author ? userBook.author.toLowerCase().trim() : null;
    const candidateAuthor = candidateBook.author ? candidateBook.author.toLowerCase().trim() : null;
    if (userAuthor && candidateAuthor && userAuthor === candidateAuthor) {
      const authorScore = 1 * weightMultiplier;
      score += authorScore;
      if (!authorMatches.has(candidateAuthor)) {
        authorMatches.add(candidateAuthor);
        const reviewNote = hasReview ? ' (reviewed)' : '';
        reasons.push({
          type: 'author',
          value: candidateBook.author, // Use original case for display
          message: `Same author as "${userBook.title}"${reviewNote}`
        });
      }
    }

    // Shared genres (if using genres array) - also give higher weight
    if (candidateBook.genres && userBook.genres) {
      const shared = candidateBook.genres.filter(g => userBook.genres.includes(g));
      const genresScore = shared.length * 2 * weightMultiplier; // Weighted by user engagement
      score += genresScore;
      shared.forEach(genre => {
        if (!genreMatches.has(genre)) {
          genreMatches.add(genre);
          const reviewNote = hasReview ? ' (reviewed)' : '';
          reasons.push({
            type: 'genre',
            value: genre,
            message: `Similar to your ${genre} books${reviewNote}`
          });
        }
      });
    }
  });

  return { score, reasons };
}

/**
 * Generate a batch of recommendations using tiered shuffling
 */
export function generateTieredRecommendations(userBooks, allBooks, batchSize = 750) {
  // STRICT: Only use user's actual library data - no sample/mock data
  if (!allBooks || allBooks.length === 0) {
    return [];
  }
  
  // STRICT: If user has no relevant books (saved, favorited, or rated), return no recommendations
  // Do not use any fallback or sample data
  if (!userBooks || userBooks.length === 0) {
    return [];
  }

  // Exclude already interacted books - use normalized ISBN comparison
  // Normalize ISBNs by removing dashes and converting to lowercase for reliable matching
  const normalizeIsbn = (isbn) => {
    if (!isbn) return '';
    return String(isbn).replace(/-/g, '').toLowerCase().trim();
  };
  
  const interactedISBNs = new Set(
    userBooks
      .map(b => b.isbn)
      .filter(Boolean)
      .map(normalizeIsbn)
  );
  
  // Filter out books that are already in user's library
  // Use normalized ISBN comparison to catch variations
  const candidates = allBooks.filter(b => {
    if (!b || !b.isbn) return false;
    const normalizedCandidateIsbn = normalizeIsbn(b.isbn);
    return !interactedISBNs.has(normalizedCandidateIsbn);
  });

  // Compute similarity with reasons - ONLY based on user's actual library
  const scored = candidates.map(book => {
    const { score, reasons } = calculateSimilarity(userBooks, book);
    return {
    ...book,
      score,
      recommendationReasons: reasons
    };
  });

  // Filter out books with score 0 (no matches) - these shouldn't be recommended
  // Only recommend books that have a MINIMUM score threshold to ensure quality matches
  // Lowered to 1.0 to include significantly more recommendations (allows weaker matches)
  const MIN_SCORE_THRESHOLD = 1.0;
  const relevantBooks = scored.filter(book => book.score >= MIN_SCORE_THRESHOLD);
  
  // If no books have any similarity to user's library, return empty array
  if (relevantBooks.length === 0) {
    return [];
  }

  // Sort by score descending
  relevantBooks.sort((a, b) => b.score - a.score);

  // Split into 3 tiers
  const total = relevantBooks.length;
  const chunk = Math.floor(total / 3);
  const tier1 = shuffleArray(relevantBooks.slice(0, chunk));
  const tier2 = shuffleArray(relevantBooks.slice(chunk, chunk * 2));
  const tier3 = shuffleArray(relevantBooks.slice(chunk * 2));

  // Select books from each tier, prioritizing higher tiers but filling up to batchSize
  // Start with equal distribution, then fill remaining slots from higher tiers
  const itemsPerTier = Math.floor(batchSize / 3);
  const t1Selection = tier1.slice(0, Math.min(itemsPerTier, tier1.length));
  const t2Selection = tier2.slice(0, Math.min(itemsPerTier, tier2.length));
  const t3Selection = tier3.slice(0, Math.min(itemsPerTier, tier3.length));
  
  // Fill remaining slots from higher tiers if available
  let finalSelection = [...t1Selection, ...t2Selection, ...t3Selection];
  let remaining = batchSize - finalSelection.length;
  
  // Fill from tier 1 first (highest quality)
  if (remaining > 0 && t1Selection.length < tier1.length) {
    const additional = tier1.slice(t1Selection.length, t1Selection.length + remaining);
    finalSelection = [...t1Selection, ...additional, ...t2Selection, ...t3Selection];
    remaining = batchSize - finalSelection.length;
  }
  
  // Then fill from tier 2
  if (remaining > 0 && t2Selection.length < tier2.length) {
    const additional = tier2.slice(t2Selection.length, t2Selection.length + remaining);
    finalSelection = [...t1Selection, ...t2Selection, ...additional, ...t3Selection];
    remaining = batchSize - finalSelection.length;
  }
  
  // Finally fill from tier 3
  if (remaining > 0 && t3Selection.length < tier3.length) {
    const additional = tier3.slice(t3Selection.length, t3Selection.length + remaining);
    finalSelection = [...t1Selection, ...t2Selection, ...t3Selection, ...additional];
  }

  return finalSelection;
}
