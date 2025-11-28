import BookCard from '../BookCard/BookCard'
import styles from './TrendingSection.module.css'

const TrendingSection = ({ books = [], onAddToCart }) => {
  if (books.length === 0) {
    return null
  }

  const totalItems = books.length
  const highestRated = books.reduce(
    (best, current) => (current.rating > best.rating ? current : best),
    books[0]
  )

  return (
    <section className={styles.trendingSection}>
      <div className={styles.trendingShell}>
        <div className={styles.trendingHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Curated For You</p>
            <h2 className={styles.trendingTitle}>New &amp; Trending</h2>
            <p className={styles.trendingSubtitle}>
              Discover fresh arrivals, celebrated classics, and timely reads that our community is loving right now.
            </p>
          </div>
          <div className={styles.trendingMeta}>
            <div className={styles.metaCard}>
              <span className={styles.metaValue}>{totalItems.toString().padStart(2, '0')}</span>
              <p className={styles.metaLabel}>Featured titles</p>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaValue}>{highestRated.rating.toFixed(1)}</span>
              <p className={styles.metaLabel}>Top rating ({highestRated.title})</p>
            </div>
            <button className={styles.viewAllButton} type="button">
              View full collection
            </button>
          </div>
        </div>

        <div className={styles.trendingBooksPanel}>
          <div className={styles.panelHeader}>
            <span>Spotlight Picks</span>
            <div className={styles.panelDivider} />
          </div>
          <div className={styles.trendingBooksScroll}>
            {books.map((book, index) => (
              <BookCard 
                key={book.id || book.isbn || index} 
                book={book} 
                onAddToCart={onAddToCart}
                variant="scroll"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrendingSection

