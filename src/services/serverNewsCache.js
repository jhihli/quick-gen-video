// Server-side news caching service
// This runs on the Node.js backend to cache news for all users

import NodeCache from 'node-cache'
import axios from 'axios'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const NEWS_API_BASE_URL = 'https://newsapi.org/v2'
const CACHE_TTL = 7 * 24 * 60 * 60 // 1 week (7 days) in seconds
const CACHE_KEY = 'ai_news_articles'

// Debug: Log API key status on module load
console.log('[News Cache] API key status:', NEWS_API_KEY ? `Configured (${NEWS_API_KEY.substring(0, 8)}...)` : 'Not configured')

// Initialize cache with 1-week TTL
const newsCache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 })

/**
 * Fetch news articles with server-side caching
 * This ensures all users share the same cache, drastically reducing API calls
 */
export const fetchNewsArticles = async () => {
  try {
    // Check cache first
    const cached = newsCache.get(CACHE_KEY)
    if (cached) {
      console.log('[News Cache] Returning cached articles (TTL remaining:', newsCache.getTtl(CACHE_KEY) - Date.now(), 'ms)')
      return {
        success: true,
        articles: cached,
        source: 'cache'
      }
    }

    // No cache - fetch from API
    console.log('[News API] Fetching fresh articles from NewsAPI...')

    // If no API key, return mock data
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_api_key_here') {
      console.warn('[News API] No API key configured, returning mock data')
      const mockArticles = getMockNews()
      newsCache.set(CACHE_KEY, mockArticles)
      return {
        success: true,
        articles: mockArticles,
        source: 'mock'
      }
    }

    // Fetch from NewsAPI
    // Focus on technology: video editing software, music production tools, image processing tech
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: '("video editing software" OR "video production tools" OR "music production" OR "audio editing" OR "image editing software" OR "video codec" OR "streaming technology" OR "video rendering" OR "content creator tools" OR "creative software") AND (technology OR software OR app OR tool OR platform)',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 30,
        apiKey: NEWS_API_KEY
      },
      timeout: 10000 // 10 second timeout
    })

    if (response.data && response.data.articles) {
      // Filter out celebrity gossip, personal stories, and unrelated content
      const excludeKeywords = [
        'pregnant', 'marriage', 'divorce', 'dating', 'celebrity',
        'kardashian', 'job', 'hiring', 'remote work', 'cruise',
        'halloween', 'birthday', 'wedding', 'baby', 'kids'
      ]

      const articles = response.data.articles
        .filter(article => {
          if (!article.title || !article.description || !article.urlToImage || article.title === '[Removed]') {
            return false
          }

          // Exclude articles with celebrity/personal life keywords
          const contentLower = (article.title + ' ' + article.description).toLowerCase()
          const hasExcludedKeyword = excludeKeywords.some(keyword => contentLower.includes(keyword))

          return !hasExcludedKeyword
        })
        .slice(0, 10) // Take top 10 articles

      // Cache the results
      newsCache.set(CACHE_KEY, articles)
      console.log('[News Cache] Cached', articles.length, 'articles for 1 week')

      return {
        success: true,
        articles,
        source: 'api'
      }
    }

    // Empty response - use mock data
    const mockArticles = getMockNews()
    newsCache.set(CACHE_KEY, mockArticles)
    return {
      success: true,
      articles: mockArticles,
      source: 'mock'
    }

  } catch (error) {
    console.error('[News API] Error fetching news:', error.message)

    // On error, try to return stale cache if available
    const staleCache = newsCache.get(CACHE_KEY)
    if (staleCache) {
      console.log('[News Cache] API error, returning stale cache')
      return {
        success: true,
        articles: staleCache,
        source: 'stale-cache'
      }
    }

    // No cache available - return mock data
    const mockArticles = getMockNews()
    newsCache.set(CACHE_KEY, mockArticles)
    return {
      success: false,
      articles: mockArticles,
      source: 'mock-fallback',
      error: error.message
    }
  }
}

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = () => {
  const stats = newsCache.getStats()
  const ttl = newsCache.getTtl(CACHE_KEY)
  const hasCache = newsCache.has(CACHE_KEY)

  return {
    hasCache,
    ttlRemaining: hasCache ? ttl - Date.now() : 0,
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys
  }
}

/**
 * Mock news data for development/fallback
 */
const getMockNews = () => {
  return [
    {
      title: "OpenAI Releases New Video Generation Model with Unprecedented Quality",
      description: "The latest AI model can generate photorealistic videos from text prompts, marking a significant advancement in creative AI technology.",
      url: "https://example.com/article1",
      urlToImage: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800",
      publishedAt: new Date().toISOString(),
      source: { name: "Tech News" },
      author: "AI Research Team"
    },
    {
      title: "AI Music Generation Reaches New Heights with Advanced Composition Tools",
      description: "New AI models are creating studio-quality music across multiple genres, revolutionizing the music production industry.",
      url: "https://example.com/article2",
      urlToImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: { name: "Music Tech" },
      author: "Music Innovation Lab"
    },
    {
      title: "Generative AI Transforms Video Editing Workflows for Creators",
      description: "Professional creators are adopting AI-powered tools to streamline their video production process and enhance creativity.",
      url: "https://example.com/article3",
      urlToImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: { name: "Creative AI" },
      author: "Digital Media Institute"
    },
    {
      title: "The Future of Content Creation: AI-Powered Tools Democratize Media Production",
      description: "AI technology is making professional-grade video and music creation accessible to everyone, regardless of technical expertise.",
      url: "https://example.com/article4",
      urlToImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: { name: "Digital Trends" },
      author: "Content Innovation Team"
    },
    {
      title: "Breakthrough in AI-Generated Music: Emotion and Style Control Achieved",
      description: "Researchers develop new techniques allowing precise control over the emotional tone and musical style of AI-generated compositions.",
      url: "https://example.com/article5",
      urlToImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: { name: "AI Research" },
      author: "Audio AI Lab"
    },
    {
      title: "Video Generation AI Now Supports Long-Form Content Creation",
      description: "Latest models can generate coherent video content spanning several minutes with consistent characters and storylines.",
      url: "https://example.com/article6",
      urlToImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      source: { name: "Video Tech" },
      author: "Visual AI Research"
    }
  ]
}

export default { fetchNewsArticles, getCacheStats }
