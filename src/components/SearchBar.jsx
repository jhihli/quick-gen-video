import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { searchableContent } from '../data/searchableContent'
import { fetchNews } from '../services/newsService'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [newsArticles, setNewsArticles] = useState([])
  const [combinedContent, setCombinedContent] = useState(searchableContent)
  const searchRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const fuseRef = useRef(null)

  // Fetch news articles on mount
  useEffect(() => {
    const loadNewsArticles = async () => {
      try {
        const articles = await fetchNews()

        // Transform news articles to searchable format
        const searchableArticles = articles.map((article, index) => ({
          id: `news-article-${index}`,
          title: article.title,
          description: article.description || '',
          keywords: [
            // Extract keywords from title and description
            ...article.title.toLowerCase().split(' ').filter(word => word.length > 3),
            ...(article.description || '').toLowerCase().split(' ').filter(word => word.length > 3)
          ],
          path: '/news',
          category: 'article',
          // Store additional article data for navigation
          articleData: article
        }))

        setNewsArticles(searchableArticles)

        // Combine static content with news articles
        const combined = [...searchableContent, ...searchableArticles]
        setCombinedContent(combined)

        // Update Fuse instance with combined content
        fuseRef.current = new Fuse(combined, {
          keys: [
            { name: 'title', weight: 3 },
            { name: 'description', weight: 2 },
            { name: 'keywords', weight: 1 }
          ],
          threshold: 0.2, // More strict: 0.0 = exact match, 1.0 = match anything
          ignoreLocation: true,
          minMatchCharLength: 2, // Require at least 2 characters to match
          includeScore: true
        })
      } catch (error) {
        console.error('Error loading news articles for search:', error)
        // Initialize Fuse with static content only if news fetch fails
        fuseRef.current = new Fuse(searchableContent, {
          keys: [
            { name: 'title', weight: 3 },
            { name: 'description', weight: 2 },
            { name: 'keywords', weight: 1 }
          ],
          threshold: 0.2,
          ignoreLocation: true,
          minMatchCharLength: 2,
          includeScore: true
        })
      }
    }

    // Initialize Fuse with static content first
    fuseRef.current = new Fuse(searchableContent, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'keywords', weight: 1 }
      ],
      threshold: 0.2,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true
    })

    loadNewsArticles()
  }, [])

  // Handle search input
  useEffect(() => {
    if (query.trim().length > 0 && fuseRef.current) {
      const searchResults = fuseRef.current.search(query)
      setResults(searchResults.slice(0, 8)) // Limit to 8 results
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex].item)
        } else if (results.length > 0) {
          handleResultClick(results[0].item)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
      default:
        break
    }
  }

  // Handle result selection
  const handleResultClick = (item) => {
    if (item.category === 'article' && item.articleData) {
      // For news articles, navigate to /news with article data in state
      navigate(item.path, { state: { selectedArticle: item.articleData, openModal: true } })
    } else {
      // For static pages, normal navigation
      navigate(item.path)
    }
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Get category badge color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'page':
        return 'from-blue-500 to-cyan-500'
      case 'tips':
        return 'from-purple-500 to-pink-500'
      case 'technical':
        return 'from-orange-500 to-red-500'
      case 'article':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Highlight matched text
  const highlightMatch = (text, query) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-cyan-400/30 text-cyan-300 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(true)}
            placeholder="Search..."
            className="w-full pl-10 pr-10 py-2 bg-white/10 hover:bg-white/15 focus:bg-white/20 backdrop-blur-md border border-white/20 hover:border-white/30 focus:border-cyan-400/50 rounded-full text-white placeholder-gray-400 outline-none transition-all duration-200 text-sm"
          />

          {/* Clear Button */}
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-gradient-to-br from-slate-800/95 via-gray-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {results.map((result, index) => (
                <motion.div
                  key={result.item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handleResultClick(result.item)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0 ${
                    selectedIndex === index
                      ? 'bg-cyan-500/20 border-l-4 border-l-cyan-400'
                      : 'hover:bg-white/10 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h4 className="text-white font-semibold text-sm mb-1 truncate">
                        {highlightMatch(result.item.title, query)}
                      </h4>

                      {/* Description */}
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {highlightMatch(result.item.description, query)}
                      </p>
                    </div>

                    {/* Category Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${getCategoryColor(
                          result.item.category
                        )}`}
                      >
                        {result.item.category}
                      </span>
                    </div>
                  </div>

                  {/* Path Preview */}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    {result.item.path}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-2 bg-black/30 border-t border-white/10">
              <p className="text-xs text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs">↑↓</kbd>
                  Navigate
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-xs">Esc</kbd>
                  Close
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-gradient-to-br from-slate-800/95 via-gray-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-6 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm">No results found for "{query}"</p>
              <p className="text-gray-500 text-xs mt-1">Try different keywords</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  )
}

export default SearchBar
