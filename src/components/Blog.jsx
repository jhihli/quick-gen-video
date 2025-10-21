import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { LogoIcon } from './AnimatedIcons'
import LanguageSelector from './LanguageSelector'
import BlogNavigation from './BlogNavigation'
import TipCard from './TipCard'
import CaseStudy from './CaseStudy'
import YouTubeVideo from './YouTubeVideo'
import Footer from './Footer'

const Blog = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('video-topics')
  const [readingProgress, setReadingProgress] = useState(0)

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setReadingProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Section data based on blog_reference.txt
  const sections = [
    {
      id: 'video-topics',
      title: 'Pick Smarter Video Topics',
      number: '1',
      description: 'The foundation of any great video is a topic that grabs attention and feels personal. With QWGenv, you\'re creating short, engaging slideshows, so your topic needs to hook viewers fast—think 15-30 seconds of pure impact.',
      tips: [
        {
          title: 'Define Your Audience Clearly',
          content: 'Are you targeting TikTok teens, family sharers, or small business promoters? For example, a local café could create a slideshow of cozy ambiance shots for Instagram followers. Narrow your focus for better engagement.'
        },
        {
          title: 'Choose Passionate Ideas',
          content: 'Pick topics you love, like travel recaps or pet moments, to stay motivated. Passionate projects shine through in QWGenv\'s quick edits.'
        },
        {
          title: 'Stick to Familiar Themes',
          content: 'Use what you know, like daily routines for vlogs, to avoid research overload and keep content authentic.'
        },
        {
          title: 'Poll Your Community',
          content: 'Ask followers on X or Instagram what they want (e.g., "Funniest pet slideshows or travel recaps?") to ensure your video hits the mark.'
        }
      ],
      caseStudy: {
        title: 'Sarah\'s Pet Store Promo',
        content: 'Sarah runs a small pet store and wants to attract local customers. She defines her audience as pet owners in her town and polls her Instagram followers, who request "cute pet moments." Passionate about animals, she chooses to create a slideshow of adoptable puppies using QWGenv. She selects photos from her shop\'s daily activities, ensuring they\'re personal and familiar. The resulting 20-second video, shared on Instagram, gets 500 views and drives 10 new customers to her store, proving the power of audience-focused topics.'
      }
    },
    {
      id: 'prep-process',
      title: 'Prep for a Smoother Process',
      number: '2',
      description: 'Great videos start with smart preparation, especially when using QWGenv\'s streamlined 3-step wizard (Upload → Music → Export). A little planning goes a long way to avoid hiccups, like incompatible files or disorganized media.',
      tips: [
        {
          title: 'Research Trending Shorts',
          content: 'Check TikTok or Instagram Reels for popular slideshow styles, like "Day in the Life" or "Before/After" formats, to inspire your uploads.'
        },
        {
          title: 'Plan Your Sequence',
          content: 'List 5-10 photos/videos in order (e.g., "start with sunrise, end with sunset"). A quick sketch ensures a cohesive story.'
        },
        {
          title: 'Check File Compatibility',
          content: 'Confirm uploads are under QWGenv\'s limits (10MB per file, 10 files max). Convert videos to MP4 if needed using free online tools.'
        },
        {
          title: 'Prep Your Environment',
          content: 'Charge devices, clear storage, and choose a quiet spot for voiceovers or music selection to avoid interruptions.'
        }
      ],
      caseStudy: {
        title: 'Alex\'s Travel Vlog Prep',
        content: 'Alex, a travel enthusiast, wants to create a TikTok slideshow of his recent beach trip using QWGenv. He researches trending travel shorts and notices "Day in the Life" formats are popular. He plans a sequence of 8 photos (beach sunrise, snorkeling, sunset dinner) and checks that each is under 10MB, converting a video clip to MP4. He preps his phone with full battery and a quiet workspace to select music. His organized approach lets him generate a 25-second video in under 10 minutes, which gets 1,000 TikTok views.'
      }
    },
    {
      id: 'better-media',
      title: 'Capture or Select Better Media',
      number: '3',
      description: 'The heart of your QWGenv slideshow is the media you upload—photos or videos that tell your story. Quality visuals are key to grabbing attention in seconds, whether you\'re shooting fresh content or selecting from your gallery.',
      tips: [
        {
          title: 'Prioritize Clear Images',
          content: 'Use high-res photos or HD videos (at least 720p) for crisp QWGenv outputs. Your phone\'s camera is often enough.'
        },
        {
          title: 'Stabilize New Shots',
          content: 'If filming, use a tripod or prop your phone on a steady surface to avoid shaky clips that disrupt slideshow flow.'
        },
        {
          title: 'Frame with Rule of Thirds',
          content: 'Position key subjects (e.g., a person or landmark) off-center for visually appealing compositions in photos or videos.'
        },
        {
          title: 'Grab Extra Clips',
          content: 'Include 2-3 extra "B-roll" shots, like close-ups or scenic pans, to add variety when generating your video.'
        }
      ],
      caseStudy: {
        title: 'Mia\'s Event Recap',
        content: 'Mia wants to share a birthday party slideshow on Instagram using QWGenv. She shoots new photos with her phone, ensuring 720p resolution for clarity. Using a small tripod, she captures steady shots of the cake and dancing. She frames guests off-center for dynamic compositions and adds B-roll of decorations. Uploading 7 photos to QWGenv, her 30-second slideshow looks professional and gets 300 likes, with friends praising the vibrant visuals.'
      }
    },
    {
      id: 'lighting-content',
      title: 'Light Up Your Content',
      number: '4',
      description: 'Lighting can make or break your slideshow\'s visual appeal, even in QWGenv\'s quick generation process. Whether you\'re shooting new photos/videos or enhancing existing ones, good lighting highlights details and sets the mood.',
      tips: [
        {
          title: 'Use Soft Natural Light',
          content: 'Shoot photos/videos near windows or in shaded outdoor areas for flattering, even lighting without harsh shadows.'
        },
        {
          title: 'Try Basic 3-Point Lighting',
          content: 'For indoor shoots, use a main light (e.g., lamp), a softer fill light, and a backlight to add depth.'
        },
        {
          title: 'Soften with Household Items',
          content: 'Diffuse lights with white sheets or paper for gentler effects on faces or objects.'
        },
        {
          title: 'Match Light Colors',
          content: 'Ensure all lights (e.g., daylight from windows, warm bulbs) have similar tones to avoid color clashes in your slideshow.'
        }
      ],
      caseStudy: {
        title: 'Liam\'s Product Showcase',
        content: 'Liam, a small business owner, uses QWGenv to create a product slideshow for his handmade candles. He shoots photos near a window for soft natural light, avoiding harsh shadows. For indoor shots, he sets up a lamp as the main light, a softer desk lamp as fill, and a phone flashlight as a backlight. He diffuses the main light with a white cloth and ensures all lights are warm-toned. His QWGenv video, uploaded to TikTok, highlights the candles\' glow, earning 2,000 views and 50 sales inquiries.'
      }
    },
    {
      id: 'audio-quality',
      title: 'Nail the Audio',
      number: '5',
      description: 'Audio is the soul of your QWGenv slideshow, bringing energy and emotion through music or voiceovers. Since QWGenv\'s MusicSelector lets you upload MP3/WAV files or choose from a pre-loaded library, picking clear, high-quality audio is essential.',
      tips: [
        {
          title: 'Choose High-Quality Music',
          content: 'Upload clear MP3/WAV files or select from QWGenv\'s local music library for vibrant sound.'
        },
        {
          title: 'Monitor Audio Levels',
          content: 'Preview tracks in QWGenv\'s MusicSelector to ensure no clipping or distortion; adjust volume if needed.'
        },
        {
          title: 'Record in Quiet Spaces',
          content: 'If adding voiceovers, use a calm room with soft surfaces (e.g., carpets) to reduce echoes.'
        },
        {
          title: 'Protect Outdoor Audio',
          content: 'For outdoor clips, use a windscreen on mics or shield your phone to keep wind noise out of your uploads.'
        }
      ],
      caseStudy: {
        title: 'Emma\'s Family Montage',
        content: 'Emma creates a family reunion slideshow with QWGenv for YouTube. She uploads a high-quality MP3 of an upbeat family song from her computer, previewing it in MusicSelector to confirm clear audio. For a short voiceover intro, she records in her quiet living room with blankets on the floor to dampen echoes. Her outdoor video clips, recorded with a windscreen, stay noise-free. The 30-second video, shared via QWGenv\'s QR code, gets 400 family views and heartfelt comments.'
      }
    },
    {
      id: 'generate-edit',
      title: 'Generate and Edit Smarter',
      number: '6',
      description: 'QWGenv\'s VideoExport component makes video creation a breeze, but a few smart choices during generation can elevate your slideshow from good to great. With features like smart duration calculation and mobile-optimized output, you can craft professional shorts effortlessly.',
      tips: [
        {
          title: 'Organize Uploads First',
          content: 'Tag files by theme (e.g., "vacation_day1") in UploadPhotos to streamline QWGenv\'s processing.'
        },
        {
          title: 'Time Transitions Smoothly',
          content: 'Set equal durations (e.g., 3 seconds per photo) in VideoExport for a balanced flow; avoid overly fast cuts.'
        },
        {
          title: 'Match Music to Mood',
          content: 'Pick upbeat tracks for fun slideshows or calm ones for emotional montages; loop or trim in QWGenv for perfect sync.'
        },
        {
          title: 'Tweak Colors Simply',
          content: 'Use QWGenv\'s basic color adjustments to boost vibrancy or fix dull uploads for a polished look.'
        }
      ],
      caseStudy: {
        title: 'Noah\'s Fitness Journey',
        content: 'Noah, a fitness coach, uses QWGenv to create a "Before/After" slideshow for Instagram. He tags 6 photos (e.g., "before_workout," "after_workout") in UploadPhotos for easy organization. He sets 3-second transitions for a snappy pace and chooses an energetic track, looping it to match the 18-second video. He tweaks colors to make his gym shots pop. The polished slideshow, shared on Instagram, gets 1,500 views and 20 new client inquiries.'
      }
    },
    {
      id: 'share-promote',
      title: 'Share and Promote Effectively',
      number: '7',
      description: 'Your QWGenv video deserves to be seen! With built-in QR code sharing and a focus on platforms like YouTube or TikTok, promoting your slideshow can drive views and engagement.',
      tips: [
        {
          title: 'Optimize for Platforms',
          content: 'Upload to YouTube for mass reach or Vimeo for niche audiences; use titles like "Quick TikTok Slideshow with QWGenv" with keywords.'
        },
        {
          title: 'Write Strong Descriptions',
          content: 'Include keywords (e.g., "fast video maker") and your site\'s link (https://wgenv.com) in YouTube/Vimeo descriptions for SEO.'
        },
        {
          title: 'Share Fast with QR Codes',
          content: 'Use QWGenv\'s QR code feature for instant mobile sharing; post on X or TikTok for quick traction.'
        },
        {
          title: 'Encourage Engagement',
          content: 'Ask viewers to like/comment/share in descriptions and within videos to boost visibility.'
        }
      ],
      caseStudy: {
        title: 'Olivia\'s Wedding Teaser',
        content: 'Olivia creates a wedding teaser slideshow with QWGenv to share with guests. She uploads it to YouTube with the title "Romantic Wedding Slideshow with QWGenv," including "slideshow maker" in the description and a link to https://wgenv.com. She uses QWGenv\'s QR code feature to share the video via WhatsApp, making it easy for guests to view on mobile. She adds a "Comment your favorite moment!" overlay, sparking 50 comments and 800 views, boosting her blog\'s traffic.'
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-700 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="bg-white/10 backdrop-blur-md border-b border-white/20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <LogoIcon size={8} className="hidden sm:block" />
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                QWGenv
              </h1>
            </motion.div>

            <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden font-bold">HOME</span>
              </Link>
              <Link
                to="/generator"
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Generator</span>
                <span className="sm:hidden font-bold">TOOL</span>
              </Link>
              <Link
                to="/help"
                className="text-white font-medium border-b-2 border-purple-400 pb-1 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden font-bold">HELP</span>
              </Link>
              <LanguageSelector />
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Blog Navigation */}
      <BlogNavigation
        sections={sections}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 ml-0 lg:ml-64">
        {/* Hero Section - Minimal Split-Screen Layout */}
        <motion.div
          className="mb-8 sm:mb-16 px-4 sm:px-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Master Short
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Video Creation
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                Transform photos and music into professional slideshows that shine on TikTok, Instagram, and YouTube.
              </p>
              
              <Link
                to="/generator"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base sm:text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2">🚀</span>
                Start Creating
                <span className="ml-2">→</span>
              </Link>
            </div>
            
            {/* Right side - Stats/Features with Enhanced Animations */}
            <div className="space-y-4 sm:space-y-6 mt-2 lg:mt-0">
              {[
                { number: "3", label: "Simple Steps", icon: "⚡", color: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-400/30", textColor: "text-yellow-400" },
                { number: "7", label: "Expert Strategies", icon: "🎯", color: "from-red-500/20 to-pink-500/20", border: "border-red-400/30", textColor: "text-red-400" },
                { number: "∞", label: "Creative Possibilities", icon: "✨", color: "from-purple-500/20 to-indigo-500/20", border: "border-purple-400/30", textColor: "text-purple-400" }
              ].map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="group relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-500"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
                  }}
                  initial={{ opacity: 0, x: 50, rotateY: -15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ 
                    delay: 0.3 + index * 0.2,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  />
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${20 + i * 20}%`
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.5, 1]
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative flex items-center space-x-4 p-4 sm:p-6">
                    {/* Animated icon container */}
                    <motion.div 
                      className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.color} rounded-full border ${stat.border} relative`}
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Pulsing ring effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-full border-2 ${stat.border}`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      />
                      
                      <motion.span 
                        className="text-lg sm:text-2xl relative z-10"
                        animate={{
                          rotateY: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 1
                        }}
                      >
                        {stat.icon}
                      </motion.span>
                    </motion.div>
                    
                    <div className="flex-1">
                      {/* Animated number counter */}
                      <motion.div 
                        className={`text-2xl sm:text-3xl font-black ${stat.textColor} leading-none`}
                        whileHover={{ scale: 1.1 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: 0.5 + index * 0.2,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        {stat.number === "∞" ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ 
                              duration: 10,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="inline-block"
                          >
                            ∞
                          </motion.span>
                        ) : (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.2 }}
                          >
                            {stat.number}
                          </motion.span>
                        )}
                      </motion.div>
                      
                      {/* Animated label with typewriter effect */}
                      <motion.div 
                        className="text-sm sm:text-base text-gray-300 font-medium mt-1 overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        transition={{ 
                          delay: 0.8 + index * 0.2,
                          duration: 0.8
                        }}
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            delay: 1 + index * 0.2,
                            duration: 0.5
                          }}
                        >
                          {stat.label}
                        </motion.span>
                      </motion.div>
                    </div>
                    
                    {/* Hover indicator */}
                    <motion.div
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                  </div>
                  
                  {/* Bottom progress line animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      delay: 1.2 + index * 0.3,
                      duration: 1,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={section.id}
            id={section.id}
            className="mb-8 sm:mb-16 scroll-mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-br from-slate-800/50 via-gray-800/30 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-3 sm:mr-4 flex-shrink-0">
                  {section.number}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">{section.title}</h2>
              </div>

              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                {section.description}
              </p>

              {/* Tips Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {section.tips.map((tip, tipIndex) => (
                  <TipCard key={tipIndex} tip={tip} index={tipIndex} />
                ))}
              </div>
            </div>
          </motion.section>
        ))}

        {/* Closing Section */}
        <motion.div
          className="text-center bg-gradient-to-r from-purple-900/30 to-cyan-900/30 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Ready to Create Amazing Videos?</h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            With QWGenv's easy upload-music-generate process, you're equipped to create short videos that shine on any platform. Start small, experiment with these tips, and share your creations!
          </p>
          <Link
            to="/generator"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500 text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">🎬</span>
            Start Creating Now
            <span className="ml-2">→</span>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Blog