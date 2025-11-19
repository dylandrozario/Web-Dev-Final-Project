import React from 'react'
import FilterGroup from '../FilterGroup/FilterGroup'
import styles from './FiltersSidebar.module.css'

const FiltersSidebar = ({ filters, onFilterChange }) => {
  const filterGroups = [
    {
      id: 'category',
      title: 'Category',
      options: [
        { value: 'fiction', label: 'Fiction' },
        { value: 'non-fiction', label: 'Non-Fiction' },
        { value: 'mystery', label: 'Mystery' },
        { value: 'fantasy', label: 'Fantasy' },
        { value: 'romance', label: 'Romance' },
        { value: 'dystopian', label: 'Dystopian' },
      ]
    },
    {
      id: 'languages',
      title: 'Languages',
      options: [
        { value: 'english', label: 'English' },
        { value: 'spanish', label: 'Spanish' },
      ]
    },
    {
      id: 'age',
      title: 'Audience Age',
      options: [
        { value: 'adult', label: 'Adult' },
        { value: 'young-adult', label: 'Young Adult' },
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
  ]

  return (
    <aside className={styles.filtersSidebar}>
      <h3 className={styles.filtersTitle}>Filters</h3>
      {filterGroups.map((group) => (
        <FilterGroup
          key={group.id}
          id={group.id}
          title={group.title}
          options={group.options}
          selectedFilters={filters[group.id] || []}
          onFilterChange={(value, checked) => {
            onFilterChange(group.id, value, checked)
          }}
        />
      ))}
    </aside>
  )
}

export default FiltersSidebar

