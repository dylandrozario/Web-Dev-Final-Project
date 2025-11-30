import shuffleArray from '../utils/shuffle';

/**
 * Calculate similarity between a candidate book and user's liked/saved/rated books (≥ 3 stars)
 */
export function calculateSimilarity(userBooks, candidateBook) {
  if (!userBooks || userBooks.length === 0) return 0;

  let score = 0;

  userBooks.forEach(userBook => {
    // Only consider liked, saved, or rated ≥ 3
    const relevant = userBook.saved || userBook.favorite || (userBook.rated && userBook.rating >= 3);
    if (!relevant) return;

    // Same author
    if (candidateBook.author && userBook.author && candidateBook.author === userBook.author) {
      score += 1;
    }

    // Shared genres
    if (candidateBook.genres && userBook.genres) {
      const shared = candidateBook.genres.filter(g => userBook.genres.includes(g));
      score += shared.length;
    }
  });

  return score;
}

/**
 * Generate a batch of recommendations using tiered shuffling
 */
export function generateTieredRecommendations(userBooks, allBooks, batchSize = 300) {
  if (!allBooks || allBooks.length === 0) return [];

  // Exclude already interacted books
  const interactedISBNs = new Set(userBooks.map(b => b.isbn));
  const candidates = allBooks.filter(b => !interactedISBNs.has(b.isbn));

  // Compute similarity
  const scored = candidates.map(book => ({
    ...book,
    score: calculateSimilarity(userBooks, book)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Split into 3 tiers
  const total = scored.length;
  const chunk = Math.floor(total / 3);
  const tier1 = shuffleArray(scored.slice(0, chunk));
  const tier2 = shuffleArray(scored.slice(chunk, chunk * 2));
  const tier3 = shuffleArray(scored.slice(chunk * 2));

  // Select batchSize / 3 from each tier
  const t1Selection = tier1.slice(0, Math.floor(batchSize / 3));
  const t2Selection = tier2.slice(0, Math.floor(batchSize / 3));
  const t3Selection = tier3.slice(0, batchSize - t1Selection.length - t2Selection.length);

  return [...t1Selection, ...t2Selection, ...t3Selection];
}
