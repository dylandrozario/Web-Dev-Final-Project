import { useState } from 'react'
import styles from './FilterGroup.module.css'

const FilterGroup = ({ id, title, options, selectedFilters, onFilterChange, isRadio = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleChange = (value, checked) => {
    if (isRadio) {
      // For radio buttons, always pass true when selected
      onFilterChange(value, true)
    } else {
      onFilterChange(value, checked)
    }
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
                type={isRadio ? "radio" : "checkbox"}
                name={isRadio ? id : undefined}
                value={option.value}
                checked={isRadio 
                  ? selectedFilters.includes(option.value)
                  : selectedFilters.includes(option.value)
                }
                onChange={(e) => handleChange(option.value, e.target.checked)}
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

