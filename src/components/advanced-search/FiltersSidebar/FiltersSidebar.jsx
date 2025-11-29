import { useMemo } from 'react'
import FilterGroup from '../FilterGroup/FilterGroup'
import styles from './FiltersSidebar.module.css'

const FiltersSidebar = ({ filters, onFilterChange, availableGenres = [] }) => {
  // Format genres for display (capitalize first letter of each word)
  const formattedGenres = useMemo(() => {
    return availableGenres.map(genre => ({
      value: genre,
      label: genre.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }))
  }, [availableGenres])

  const filterGroups = useMemo(() => [
    {
      id: 'sortBy',
      title: 'Sort By',
      options: [
        { value: 'popular', label: 'Popular (Highest Rated)' },
        { value: 'new', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'author', label: 'Author (A-Z)' },
      ],
      isRadio: true // Sort is single selection
    },
    {
      id: 'category',
      title: 'Category',
      options: formattedGenres.length > 0 ? formattedGenres : [
        { value: 'fiction', label: 'Fiction' },
        { value: 'non-fiction', label: 'Non-Fiction' },
      ]
    },
    {
      id: 'availability',
      title: 'Availability',
      options: [
        { value: 'in-stock', label: 'In Stock' },
        { value: 'not-in-stock', label: 'Not In Stock' },
      ]
    },
  ], [formattedGenres])

  return (
    <aside className={styles.filtersSidebar}>
      <h3 className={styles.filtersTitle}>Filters</h3>
      {filterGroups.map((group) => (
        <FilterGroup
          key={group.id}
          id={group.id}
          title={group.title}
          options={group.options}
          selectedFilters={group.id === 'sortBy' 
            ? (filters[group.id] ? [filters[group.id]] : [])
            : (filters[group.id] || [])
          }
          onFilterChange={(value, checked) => {
            onFilterChange(group.id, value, checked)
          }}
          isRadio={group.isRadio}
        />
      ))}
    </aside>
  )
}

export default FiltersSidebar

