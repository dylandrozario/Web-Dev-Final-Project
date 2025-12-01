import shuffleArray from '../utils/shuffle';

/**
 * Calculate similarity between a candidate book and user's saved/favorited/rated books
 * Focuses primarily on genre matching, with author as secondary factor
 * Returns both score and recommendation reasons
 */
export function calculateSimilarity(userBooks, candidateBook) {
  if (!userBooks || userBooks.length === 0) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];
  const genreMatches = new Set();
  const authorMatches = new Set();

  userBooks.forEach(userBook => {
    // Consider saved, favorited, rated books (rating > 3), or reviewed books (but only if rating >= 3)
    const hasGoodRating = userBook.rated && userBook.rating > 3;
    // Only consider reviewed books if they have no rating or rating >= 3
    const hasReview = userBook.reviewed && userBook.review && (!userBook.rated || userBook.rating >= 3);
    const relevant = userBook.saved || userBook.favorite || hasGoodRating || hasReview;
    if (!relevant) return;

    // Calculate base weight multiplier based on user engagement
    // Reviews indicate stronger engagement, so weight them higher
    let weightMultiplier = 1.0;
    if (hasReview) {
      // Books with reviews get 2x weight (stronger signal)
      weightMultiplier = 2.0;
    } else if (userBook.rated && userBook.rating) {
      // Use actual rating value to weight (normalized to 0.5-2.5 range)
      // Rating 3 = 0.5x, Rating 4 = 1.5x, Rating 5 = 2.5x
      weightMultiplier = Math.max(0.5, (userBook.rating - 2.5));
    } else if (userBook.favorite) {
      // Favorites get 1.5x weight
      weightMultiplier = 1.5;
    } else if (userBook.saved) {
      // Saved books get base weight
      weightMultiplier = 1.0;
    }

    // Same genre - give higher weight (2 points base) since this is the primary focus
    if (candidateBook.genre && userBook.genre && candidateBook.genre === userBook.genre) {
      const genreScore = 2 * weightMultiplier;
      score += genreScore;
      if (!genreMatches.has(candidateBook.genre)) {
        genreMatches.add(candidateBook.genre);
        const reviewNote = hasReview ? ' (reviewed)' : '';
        reasons.push({
          type: 'genre',
          value: candidateBook.genre,
          message: `Similar to your ${candidateBook.genre} books${reviewNote}`
        });
      }
    }

    // Same author - secondary factor (1 point base)
    if (candidateBook.author && userBook.author && candidateBook.author === userBook.author) {
      const authorScore = 1 * weightMultiplier;
      score += authorScore;
      if (!authorMatches.has(candidateBook.author)) {
        authorMatches.add(candidateBook.author);
        const reviewNote = hasReview ? ' (reviewed)' : '';
        reasons.push({
          type: 'author',
          value: candidateBook.author,
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
export function generateTieredRecommendations(userBooks, allBooks, batchSize = 300) {
  if (!allBooks || allBooks.length === 0) return [];
  
  // If user has no relevant books (saved, favorited, or rated), return no recommendations
  if (!userBooks || userBooks.length === 0) return [];

  // Exclude already interacted books
  const interactedISBNs = new Set(userBooks.map(b => b.isbn));
  const candidates = allBooks.filter(b => !interactedISBNs.has(b.isbn));

  // Compute similarity with reasons
  const scored = candidates.map(book => {
    const { score, reasons } = calculateSimilarity(userBooks, book);
    return {
    ...book,
      score,
      recommendationReasons: reasons
    };
  });

  // Filter out books with score 0 (no matches) - these shouldn't be recommended
  const relevantBooks = scored.filter(book => book.score > 0);
  
  // If no books have any similarity, return empty array
  if (relevantBooks.length === 0) return [];

  // Sort by score descending
  relevantBooks.sort((a, b) => b.score - a.score);

  // Split into 3 tiers
  const total = relevantBooks.length;
  const chunk = Math.floor(total / 3);
  const tier1 = shuffleArray(relevantBooks.slice(0, chunk));
  const tier2 = shuffleArray(relevantBooks.slice(chunk, chunk * 2));
  const tier3 = shuffleArray(relevantBooks.slice(chunk * 2));

  // Select batchSize / 3 from each tier
  const itemsPerTier = Math.floor(batchSize / 3);
  const t1Selection = tier1.slice(0, itemsPerTier);
  const t2Selection = tier2.slice(0, itemsPerTier);
  const t3Selection = tier3.slice(0, batchSize - t1Selection.length - t2Selection.length);

  return [...t1Selection, ...t2Selection, ...t3Selection];
}
