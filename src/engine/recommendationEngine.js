import shuffleArray from '../utils/shuffle';

// Helper to check if a book has valid user interaction
const hasValidInteraction = (book) => {
  if (!book || !book.isbn) return false;
  return book.saved === true || book.favorite === true ||
         (book.rated === true && book.rating > 0) ||
         (book.reviewed === true && book.review?.trim().length > 0);
};

// Helper to calculate weight multiplier based on user engagement
const calculateWeightMultiplier = (userBook) => {
  if (userBook.reviewed === true && userBook.review?.trim().length > 0) return 2.0;
  if (userBook.rated === true && userBook.rating > 0) {
    return Math.max(0.3, (userBook.rating - 2.0) * 0.5 + 1.0);
  }
  if (userBook.favorite === true) return 1.5;
  if (userBook.saved === true) return 1.0;
  return 1.0;
};

// Helper to normalize strings for comparison
const normalizeString = (str) => str?.toLowerCase().trim() || '';

/**
 * Calculate similarity between a candidate book and user's saved/favorited/rated books
 * Focuses primarily on genre matching, with author as secondary factor
 * Returns both score and recommendation reasons
 */
export function calculateSimilarity(userBooks, candidateBook) {
  if (!userBooks?.length || !candidateBook?.isbn) return { score: 0, reasons: [] };

  const validUserBooks = userBooks.filter(hasValidInteraction);
  if (validUserBooks.length === 0) return { score: 0, reasons: [] };

  let score = 0;
  const reasons = [];
  const genreMatches = new Set();
  const authorMatches = new Set();
  const userGenres = new Set(validUserBooks.map(b => b.genre).filter(Boolean).map(normalizeString));

  validUserBooks.forEach(userBook => {
    const weightMultiplier = calculateWeightMultiplier(userBook);
    const hasReview = userBook.reviewed === true && userBook.review?.trim().length > 0;
    const reviewNote = hasReview ? ' (reviewed)' : '';

    // Genre matching (primary factor - 2 points base)
    const userGenre = normalizeString(userBook.genre);
    const candidateGenre = normalizeString(candidateBook.genre);
    if (userGenre && candidateGenre && userGenre === candidateGenre && userGenres.has(userGenre)) {
      const genreScore = 2 * weightMultiplier;
      score += genreScore;
      if (!genreMatches.has(candidateGenre)) {
        genreMatches.add(candidateGenre);
        reasons.push({
          type: 'genre',
          value: candidateBook.genre,
          message: `Similar to your ${candidateBook.genre} books${reviewNote}`
        });
      }
    }

    // Author matching (secondary factor - 1 point base)
    const userAuthor = normalizeString(userBook.author);
    const candidateAuthor = normalizeString(candidateBook.author);
    if (userAuthor && candidateAuthor && userAuthor === candidateAuthor) {
      score += 1 * weightMultiplier;
      if (!authorMatches.has(candidateAuthor)) {
        authorMatches.add(candidateAuthor);
        reasons.push({
          type: 'author',
          value: candidateBook.author,
          message: `Same author as "${userBook.title}"${reviewNote}`
        });
      }
    }

    // Shared genres array matching
    if (candidateBook.genres && userBook.genres) {
      const shared = candidateBook.genres.filter(g => userBook.genres.includes(g));
      score += shared.length * 2 * weightMultiplier;
      shared.forEach(genre => {
        if (!genreMatches.has(genre)) {
          genreMatches.add(genre);
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

// Helper to normalize ISBN for comparison
const normalizeIsbn = (isbn) => String(isbn || '').replace(/-/g, '').toLowerCase().trim();

/**
 * Generate a batch of recommendations using tiered shuffling
 */
export function generateTieredRecommendations(userBooks, allBooks, batchSize = 750) {
  if (!allBooks?.length || !userBooks?.length) return [];

  const interactedISBNs = new Set(userBooks.map(b => b.isbn).filter(Boolean).map(normalizeIsbn));
  const candidates = allBooks.filter(b => b?.isbn && !interactedISBNs.has(normalizeIsbn(b.isbn)));

  const MIN_SCORE_THRESHOLD = 1.0;
  const scored = candidates.map(book => {
    const { score, reasons } = calculateSimilarity(userBooks, book);
    return { ...book, score, recommendationReasons: reasons };
  });

  const relevantBooks = scored.filter(book => book.score >= MIN_SCORE_THRESHOLD).sort((a, b) => b.score - a.score);
  if (relevantBooks.length === 0) return [];

  // Split into 3 tiers and shuffle
  const chunk = Math.floor(relevantBooks.length / 3);
  const tiers = [
    shuffleArray(relevantBooks.slice(0, chunk)),
    shuffleArray(relevantBooks.slice(chunk, chunk * 2)),
    shuffleArray(relevantBooks.slice(chunk * 2))
  ];

  // Select from tiers, filling remaining slots from higher tiers
  const itemsPerTier = Math.floor(batchSize / 3);
  const selections = tiers.map(tier => tier.slice(0, Math.min(itemsPerTier, tier.length)));
  let finalSelection = [...selections[0], ...selections[1], ...selections[2]];
  let remaining = batchSize - finalSelection.length;

  // Fill remaining slots from higher tiers
  for (let i = 0; i < tiers.length && remaining > 0; i++) {
    const used = selections[i].length;
    const available = tiers[i].length - used;
    if (available > 0) {
      const additional = tiers[i].slice(used, used + Math.min(remaining, available));
      if (i === 0) {
        finalSelection = [...selections[0], ...additional, ...selections[1], ...selections[2]];
      } else if (i === 1) {
        finalSelection = [...selections[0], ...selections[1], ...additional, ...selections[2]];
      } else {
        finalSelection = [...selections[0], ...selections[1], ...selections[2], ...additional];
      }
      remaining = batchSize - finalSelection.length;
    }
  }

  return finalSelection;
}
