'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { X, Check } from 'lucide-react'

const categories = [
  'All',
  'Trading',
  'Research',
  'DeFi',
  'Security',
  'NFT',
  'Governance',
  'Content',
  'Analytics'
]

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $0.05', min: 0, max: 0.05 },
  { label: '$0.05 - $0.10', min: 0.05, max: 0.10 },
  { label: '$0.10 - $0.20', min: 0.10, max: 0.20 },
  { label: 'Over $0.20', min: 0.20, max: Infinity }
]

const ratings = [
  { label: 'All', min: 0 },
  { label: '4.5+ Stars', min: 4.5 },
  { label: '4.0+ Stars', min: 4.0 },
  { label: '3.5+ Stars', min: 3.5 }
]

interface AgentFiltersProps {
  onFiltersChange?: (filters: FilterState) => void
}

interface FilterState {
  category: string
  priceRange: { min: number; max: number }
  minRating: number
  onlineOnly: boolean
}

export function AgentFilters({ onFiltersChange }: AgentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    priceRange: { min: 0, max: Infinity },
    minRating: 0,
    onlineOnly: false
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const handleCategoryChange = (category: string) => {
    updateFilters({ category })
  }

  const handlePriceRangeChange = (priceRange: { min: number; max: number }) => {
    updateFilters({ priceRange })
  }

  const handleRatingChange = (minRating: number) => {
    updateFilters({ minRating })
  }

  const handleOnlineOnlyChange = (onlineOnly: boolean) => {
    updateFilters({ onlineOnly })
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: 'All',
      priceRange: { min: 0, max: Infinity },
      minRating: 0,
      onlineOnly: false
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const activeFiltersCount = [
    filters.category !== 'All',
    filters.priceRange.min !== 0 || filters.priceRange.max !== Infinity,
    filters.minRating > 0,
    filters.onlineOnly
  ].filter(Boolean).length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300">
              {activeFiltersCount} active
            </span>
          )}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isOpen ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="glassmorphism rounded-2xl p-6 space-y-6"
          >
            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Category</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    variant={filters.category === category ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filters.category === category
                        ? 'bg-primary-500 text-white'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Price Range</h4>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range) => (
                  <Button
                    key={range.label}
                    onClick={() => handlePriceRangeChange({ min: range.min, max: range.max })}
                    variant={
                      filters.priceRange.min === range.min && filters.priceRange.max === range.max
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className={
                      filters.priceRange.min === range.min && filters.priceRange.max === range.max
                        ? 'bg-primary-500 text-white'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Minimum Rating</h4>
              <div className="flex flex-wrap gap-2">
                {ratings.map((rating) => (
                  <Button
                    key={rating.label}
                    onClick={() => handleRatingChange(rating.min)}
                    variant={filters.minRating === rating.min ? 'default' : 'outline'}
                    size="sm"
                    className={
                      filters.minRating === rating.min
                        ? 'bg-primary-500 text-white'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }
                  >
                    {rating.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Online Only Filter */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onlineOnly}
                  onChange={(e) => handleOnlineOnlyChange(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-primary-500 focus:ring-primary-500/50"
                />
                <span className="text-sm text-white">Online agents only</span>
              </label>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t border-white/10">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
