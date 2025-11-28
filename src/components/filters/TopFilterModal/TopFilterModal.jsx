import { useState } from 'react'
import './TopFilterModal.css'

function TopFilterModal({ isOpen, onClose, onSelect }) {
  const [selectedOption, setSelectedOption] = useState('Top')

  if (!isOpen) return null

  const rankingOptions = [
    {
      value: 'Top',
      label: 'Top',
      description: "As determined by users' ratings"
    },
    {
      value: 'Popular',
      label: 'Popular',
      description: 'Most number of ratings'
    },
    {
      value: 'Esoteric',
      label: 'Esoteric',
      description: 'Relatively unknown but with high average ratings'
    },
    {
      value: 'Diverse',
      label: 'Diverse',
      description: "Authors are limited to one entry per chart"
    }
  ]

  const handleOptionChange = (value) => {
    setSelectedOption(value)
  }

  const handleClose = () => {
    if (onSelect && selectedOption) {
      onSelect(selectedOption)
    }
    onClose()
  }

  return (
    <>
      <div className="top-filter-modal-overlay" onClick={handleClose}></div>
      <div className="top-filter-modal-wrapper">
        <div className="top-filter-modal" onClick={(e) => e.stopPropagation()}>
          {/* Radio Options List */}
          <div className="top-filter-radio-group">
            {rankingOptions.map((option) => (
              <label 
                key={option.value}
                className="top-filter-radio-option"
              >
                <input
                  type="radio"
                  name="rankingOption"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => handleOptionChange(option.value)}
                />
                <div className="top-filter-option-content">
                  <span className="top-filter-option-label">{option.label}</span>
                  <span className="top-filter-option-description">{option.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default TopFilterModal

