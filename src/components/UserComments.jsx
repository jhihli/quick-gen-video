import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

export default function UserComments({ sessionId, onCommentSubmit }) {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [publicComments, setPublicComments] = useState([]);
  const [status, setStatus] = useState('typing'); // 'typing', 'submitting', 'cooldown', 'success', 'error'
  const [error, setError] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());

  // Fetch public comments on mount
  useEffect(() => {
    if (sessionId) {
      fetchUserSessionData();
      fetchPublicComments();
    }
  }, [sessionId]);


  // Auto-hide success message  
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('typing');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-hide success notice after submission
  useEffect(() => {
    if (showSuccessNotice) {
      const timer = setTimeout(() => {
        setShowSuccessNotice(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotice]);

  // Auto-hide error message
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchUserSessionData = async () => {
    try {
      const response = await fetch(`/api/comments/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setCommentCount(data.comments?.length || 0);
        setHasSubmitted(data.hasSubmitted || false);

        // If user has already submitted, disable the form
        if (data.hasSubmitted) {
          setStatus('submitted');
        }
      }
    } catch (err) {
      console.error('Failed to fetch session data:', err);
    }
  };

  const fetchPublicComments = async () => {
    setLoadingPublic(true);
    try {
      const response = await fetch('/api/comments/public?limit=10');
      if (response.ok) {
        const data = await response.json();
        setPublicComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch public comments:', err);
    } finally {
      setLoadingPublic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim() || status !== 'typing' || hasSubmitted) {
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          text: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCommentCount(data.comments.length);
        setHasSubmitted(true);
        setComment('');
        setStatus('submitted');
        setShowSuccessNotice(true);

        // Refresh public comments to include the new comment
        fetchPublicComments();

        if (onCommentSubmit) {
          onCommentSubmit(data.comments);
        }
      } else {
        setError(data.error || 'Failed to submit comment');

        if (data.hasSubmitted) {
          setHasSubmitted(true);
          setStatus('submitted');
        } else {
          setStatus('typing');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStatus('typing');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const isCommentExpanded = (commentId) => {
    return expandedComments.has(commentId);
  };

  const isLongComment = (text) => {
    // Simple character count check for truncation
    return text.length > 50;
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Toast Notifications */}
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 p-4 shadow-xl shadow-emerald-500/25 backdrop-blur-xl"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">
              🎉 Type your feedback here!
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 p-4 shadow-xl shadow-red-500/25 backdrop-blur-xl"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">
              ⚠️ {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <motion.div
        className="space-y-6 bg-gradient-to-br from-stone-50/50 to-amber-50/30 rounded-3xl p-6 border border-stone-200/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header Section */}
        <div className="relative">
          <div className="space-y-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 rounded-lg sm:rounded-xl blur-sm opacity-75"></div>
                <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.627 2.707-3.227V6.741c0-1.6-1.123-2.994-2.707-3.227A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.514C3.373 3.747 2.25 5.141 2.25 6.741v6.018z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-stone-800">
                  {t('feedback')}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm">{t('yourFeedbackWillSupport')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Comment Form */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-stone-200/20 to-amber-100/20 rounded-xl sm:rounded-2xl blur-md sm:blur-lg"></div>
          <div className="relative bg-gradient-to-br from-white/95 to-stone-50/95 backdrop-blur-xl border border-stone-200/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="comment-input" className="block text-xs font-semibold text-stone-700">
                  ✨ {t('shareYourThoughtsMobile')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-stone-200/30 rounded-lg sm:rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <textarea
                    id="comment-input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={status === 'submitting' || status === 'submitted' || hasSubmitted}
                    placeholder={hasSubmitted ? t('thankYouForFeedback') : t('shareExperienceWithGenerator')}
                    className="relative w-full min-h-[70px] sm:min-h-[80px] rounded-md sm:rounded-lg border border-stone-300/50 bg-white/80 backdrop-blur-sm px-2 py-2 sm:px-3 sm:py-2 text-stone-800 placeholder:text-stone-500 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 resize-none text-xs sm:text-sm leading-relaxed"
                    maxLength={200}
                    rows={3}
                  />
                  <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 text-xs text-stone-500 bg-white/60 rounded-full px-1.5 py-0.5 backdrop-blur-sm">
                    {comment.length}/200
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={
                  comment.trim().length === 0 ||
                  status === 'submitting' ||
                  status === 'submitted' ||
                  hasSubmitted
                }
                className="relative group w-full overflow-hidden rounded-md sm:rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 px-2 py-1.5 sm:px-3 sm:py-2 font-semibold text-white shadow-sm shadow-amber-500/25 transition-all duration-300 hover:shadow-md hover:shadow-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-1">
                  {status === 'submitting' && (
                    <motion.div
                      className="h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  <span className="text-xs">
                    {status === 'submitting' ? '🚀 Sending...' :
                      status === 'submitted' || hasSubmitted ? '✅ Thanks! Done' :
                        '💫 Share'}
                  </span>
                </div>
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Submission Complete Notice */}
        <AnimatePresence>
          {showSuccessNotice && (
            <motion.div
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 backdrop-blur-xl p-4 sm:p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl"></div>
              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 flex-shrink-0">
                  <motion.svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-green-200 mb-2">
                    🎉 {t('typeFeedbackHere')}
                  </h4>
                  <p className="text-green-300/80 text-sm sm:text-[15px] leading-relaxed">
                    {t('yourExperienceShared')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Community Highlights */}
        {publicComments.length > 0 && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-stone-800">
                {t('community')} ✨
              </h4>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <AnimatePresence mode="popLayout">
                {publicComments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="group relative overflow-hidden"
                    initial={{ opacity: 0, y: 30, rotateX: -15 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -30, rotateX: 15 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 25
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    layout
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-white/40 to-stone-100/30 rounded-2xl"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    />

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200/0 via-amber-300/20 to-stone-200/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Quote decoration */}
                    <div className="absolute top-2 left-2 text-amber-300/20 text-2xl font-serif leading-none">"</div>

                    <motion.div
                      className="relative rounded-xl border border-stone-200/40 bg-white/70 backdrop-blur-xl p-4 hover:border-amber-300/60 transition-all duration-500 hover:shadow-md hover:shadow-amber-100/20"
                      layout
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <motion.div
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-200/60 to-stone-200/60 border border-amber-300/40 flex-shrink-0 mt-0.5"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <svg className="h-3 w-3 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </motion.div>

                        {/* Comment and timestamp in one line */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => toggleCommentExpansion(comment.id)}
                        >
                          {!isCommentExpanded(comment.id) ? (
                            // Single line view - truncated
                            <div className="flex items-center gap-2">
                              <p className="text-stone-800 text-sm font-medium flex-1 min-w-0 truncate">
                                {comment.text}
                              </p>

                              <div className="flex items-center gap-1 text-xs text-stone-500 whitespace-nowrap flex-shrink-0">
                                <motion.svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    delay: index * 0.3
                                  }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                  <circle cx="12" cy="12" r="10" />
                                </motion.svg>
                                <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ) : (
                            // Expanded view - full text
                            <div className="space-y-2">
                              <p className="text-stone-800 text-sm leading-relaxed font-medium break-words">
                                {comment.text}
                              </p>

                              <div className="flex items-center gap-1 text-xs text-stone-500">
                                <motion.svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    delay: index * 0.3
                                  }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                                  <circle cx="12" cy="12" r="10" />
                                </motion.svg>
                                <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Subtle corner accent */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-tr-xl"></div>

                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}