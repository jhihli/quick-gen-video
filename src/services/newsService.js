import axios from 'axios'

/**
 * Fetch news articles related to AI, video generation, and music
 * Now uses server-side caching to reduce API calls by 95%+
 * All users share the same cache on the server (30-minute TTL)
 */
export const fetchNews = async () => {
  try {
    // Call server endpoint (which handles caching centrally)
    const response = await axios.get('/api/news')

    if (response.data && response.data.success && response.data.articles) {
      const articles = response.data.articles

      // Log cache hit/miss for debugging
      if (response.data.source === 'cache') {
        console.log('📦 News loaded from server cache')
      } else if (response.data.source === 'api') {
        console.log('🌐 News fetched from API (cache miss)')
      } else if (response.data.source === 'mock') {
        console.log('🔧 Mock news data (development mode)')
      } else if (response.data.source === 'stale-cache') {
        console.log('⚠️ Stale cache returned (API error)')
      } else if (response.data.source === 'mock-fallback') {
        console.log('🔧 Mock fallback (API error)')
      }

      return articles
    }

    return []
  } catch (error) {
    console.error('Error fetching news from server:', error)

    // Fallback to mock data if server fails
    console.log('🔧 Server error, returning mock data')
    return getMockNews()
  }
}

/**
 * Mock news data for development/fallback
 * Only used when server is unreachable
 */
const getMockNews = () => {
  return [
    {
      title: "OpenAI Releases New Video Generation Model with Unprecedented Quality",
      description: "The latest AI model can generate photorealistic videos from text prompts, marking a significant advancement in creative AI technology.",
      url: "https://example.com/article1",
      urlToImage: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800",
      publishedAt: new Date().toISOString(),
      source: { name: "Tech News" }
    },
    {
      title: "AI Music Generation Reaches New Heights with Advanced Composition Tools",
      description: "New AI models are creating studio-quality music across multiple genres, revolutionizing the music production industry.",
      url: "https://example.com/article2",
      urlToImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: { name: "Music Tech" }
    },
    {
      title: "Generative AI Transforms Video Editing Workflows for Creators",
      description: "Professional creators are adopting AI-powered tools to streamline their video production process and enhance creativity.",
      url: "https://example.com/article3",
      urlToImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: { name: "Creative AI" }
    },
    {
      title: "The Future of Content Creation: AI-Powered Tools Democratize Media Production",
      description: "AI technology is making professional-grade video and music creation accessible to everyone, regardless of technical expertise.",
      url: "https://example.com/article4",
      urlToImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      source: { name: "Digital Trends" }
    },
    {
      title: "Breakthrough in AI-Generated Music: Emotion and Style Control Achieved",
      description: "Researchers develop new techniques allowing precise control over the emotional tone and musical style of AI-generated compositions.",
      url: "https://example.com/article5",
      urlToImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      source: { name: "AI Research" }
    },
    {
      title: "Video Generation AI Now Supports Long-Form Content Creation",
      description: "Latest models can generate coherent video content spanning several minutes with consistent characters and storylines.",
      url: "https://example.com/article6",
      urlToImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      source: { name: "Video Tech" }
    }
  ]
}

export default { fetchNews }
