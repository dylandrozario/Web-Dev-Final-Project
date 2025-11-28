import { useState } from 'react'
import styles from './FilterGroup.module.css'

const FilterGroup = ({ id, title, options, selectedFilters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleCheckboxChange = (value, checked) => {
    onFilterChange(value, checked)
  }

  return (
    <div className={styles.filterGroup}>
      <button 
        className={styles.filterHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`${id}-filter`}
      >
        {title} <span className={`${styles.filterArrow} ${isExpanded ? styles.expanded : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div id={`${id}-filter`} className={styles.filterContent}>
          {options.map((option) => (
            <label key={option.value} className={styles.filterCheckbox}>
              <input
                type="checkbox"
                value={option.value}
                checked={selectedFilters.includes(option.value)}
                onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterGroup

