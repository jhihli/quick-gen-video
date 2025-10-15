// Centralized searchable content for the entire application
export const searchableContent = [
  // Home Page Content
  {
    id: 'home-hero',
    title: 'QWGenv - Video Generator',
    description: 'Edit videos with preferred music and create vibrant videos',
    keywords: ['video', 'generator', 'music', 'edit', 'create', 'animated', 'avatars', 'photos'],
    path: '/',
    category: 'page'
  },
  {
    id: 'home-features',
    title: 'Features',
    description: 'Upload photos, select music, generate videos',
    keywords: ['upload', 'photos', 'select', 'music', 'generate', 'video', 'features'],
    path: '/',
    category: 'page'
  },

  // Generator Page
  {
    id: 'generator',
    title: 'Video Generator Tool',
    description: 'Upload photos, select music, add avatars, and generate your video',
    keywords: ['generator', 'tool', 'upload', 'music', 'avatar', 'create', 'video', 'export'],
    path: '/generator',
    category: 'page'
  },

  // Help Center Landing
  {
    id: 'help-center',
    title: 'Help Center',
    description: 'Everything you need to know about creating amazing videos',
    keywords: ['help', 'support', 'guide', 'tutorial', 'tips', 'technical'],
    path: '/help',
    category: 'page'
  },

  // Video Creation Tips
  {
    id: 'prep-process',
    title: 'Prep Your Process Right',
    description: 'Learn how to prepare your content and workflow',
    keywords: ['prep', 'process', 'workflow', 'organize', 'plan', 'prepare', 'photos', 'upload'],
    path: '/help/prep-process',
    category: 'tips'
  },
  {
    id: 'lighting-content',
    title: 'Light Up Your Content',
    description: 'Master lighting techniques for better video quality',
    keywords: ['lighting', 'light', 'content', 'quality', 'brightness', 'photography', 'three-point'],
    path: '/help/lighting-content',
    category: 'tips'
  },
  {
    id: 'video-topics',
    title: 'Pick Smarter Video Topics',
    description: 'Choose engaging topics that resonate with your audience',
    keywords: ['topics', 'video', 'content', 'planning', 'ideas', 'strategy', 'audience'],
    path: '/help/video-topics',
    category: 'tips'
  },
  {
    id: 'music-matters',
    title: 'Make Music Matters',
    description: 'Select the perfect background music for your videos',
    keywords: ['music', 'audio', 'background', 'sound', 'BGM', 'soundtrack', 'mood'],
    path: '/help/music-matters',
    category: 'tips'
  },
  {
    id: 'generate-edit',
    title: 'Generate and Edit Smarter',
    description: 'Learn advanced generation and editing techniques',
    keywords: ['generate', 'edit', 'smart', 'advanced', 'techniques', 'tips', 'avatar'],
    path: '/help/generate-edit',
    category: 'tips'
  },
  {
    id: 'share-promote',
    title: 'Share and Promote Effectively',
    description: 'Best practices for sharing and promoting your videos',
    keywords: ['share', 'promote', 'social media', 'marketing', 'distribution', 'export'],
    path: '/help/share-promote',
    category: 'tips'
  },

  // Technical Knowledge
  {
    id: 'ffmpeg-basics',
    title: 'What is FFmpeg?',
    description: 'Understanding the video processing engine behind QWGenv',
    keywords: ['ffmpeg', 'technical', 'video', 'processing', 'encoding', 'conversion', 'tool'],
    path: '/help/ffmpeg-basics',
    category: 'technical'
  },
  {
    id: 'media-formats',
    title: 'Supported Media Formats',
    description: 'Learn about supported photo and video formats',
    keywords: ['formats', 'media', 'supported', 'file types', 'jpg', 'png', 'mp4', 'webm', 'video', 'photo'],
    path: '/help/media-formats',
    category: 'technical'
  },
  {
    id: 'video-generation',
    title: 'How Videos Are Generated',
    description: 'Technical overview of the video generation process',
    keywords: ['generation', 'process', 'technical', 'how it works', 'video', 'creation', 'workflow'],
    path: '/help/video-generation',
    category: 'technical'
  },
  {
    id: 'why-mp4-better',
    title: 'Why MP4 Format Better?',
    description: 'Understanding MP4 advantages for video delivery',
    keywords: ['mp4', 'format', 'video', 'compression', 'compatibility', 'quality', 'file size'],
    path: '/help/why-mp4-better',
    category: 'technical'
  },
  {
    id: 'free-bgm-sources',
    title: 'Free BGM Music Sources',
    description: 'Discover free background music resources',
    keywords: ['bgm', 'background music', 'free', 'music', 'sources', 'royalty-free', 'audio', 'sound'],
    path: '/help/free-bgm-sources',
    category: 'technical'
  },
  {
    id: 'webm-ffmpeg',
    title: 'WebM with FFmpeg',
    description: 'How WebM format works with FFmpeg processing',
    keywords: ['webm', 'ffmpeg', 'format', 'processing', 'video', 'encoding', 'technical'],
    path: '/help/webm-ffmpeg',
    category: 'technical'
  }
]

// Helper function to get all unique keywords
export const getAllKeywords = () => {
  const keywordsSet = new Set()
  searchableContent.forEach(item => {
    item.keywords.forEach(keyword => keywordsSet.add(keyword))
  })
  return Array.from(keywordsSet).sort()
}

// Helper function to search by category
export const getContentByCategory = (category) => {
  return searchableContent.filter(item => item.category === category)
}
