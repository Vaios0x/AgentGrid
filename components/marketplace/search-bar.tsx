'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '../ui/button'

interface SearchBarProps {
  onSearch?: (query: string) => void
  onFilter?: () => void
}

export function SearchBar({ onSearch, onFilter }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch?.('')
  }

  return (
    <div className="flex gap-4 mb-6">
      <form onSubmit={handleSearch} className="flex-1 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by name, category, or capability..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl glassmorphism border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
      
      <Button
        onClick={onFilter}
        variant="outline"
        size="lg"
        className="border-white/20 text-white hover:bg-white/10 px-6"
      >
        <Filter className="w-5 h-5 mr-2" />
        Filters
      </Button>
    </div>
  )
}
