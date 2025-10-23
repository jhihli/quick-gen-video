/**
 * Cookie Manager Utility
 * Handles cookie operations for AdSense tracking and session management
 */

/**
 * Set a cookie with specified name, value, and options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options (days, path, secure, sameSite)
 */
export const setCookie = (name, value, options = {}) => {
  const {
    days = 7,
    path = '/',
    secure = window.location.protocol === 'https:',
    sameSite = 'Lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export const deleteCookie = (name, path = '/') => {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
};

/**
 * Check if cookies are enabled in the browser
 * @returns {boolean} - True if cookies are enabled
 */
export const areCookiesEnabled = () => {
  try {
    const testCookie = '__cookie_test__';
    setCookie(testCookie, 'test', { days: 1 });
    const enabled = getCookie(testCookie) === 'test';
    deleteCookie(testCookie);
    return enabled;
  } catch (error) {
    return false;
  }
};

/**
 * Set session ID cookie for file management
 * @param {string} sessionId - Unique session identifier
 */
export const setSessionCookie = (sessionId) => {
  setCookie('qwimgenv_session', sessionId, {
    days: 1, // Session cookie expires in 1 day
    secure: true,
    sameSite: 'Strict'
  });
};

/**
 * Get current session ID from cookie
 * @returns {string|null} - Session ID or null
 */
export const getSessionCookie = () => {
  return getCookie('qwimgenv_session');
};

/**
 * Clear session cookie
 */
export const clearSessionCookie = () => {
  deleteCookie('qwimgenv_session');
};

/**
 * Initialize AdSense cookie consent (placeholder for future expansion)
 * This allows AdSense to set its own tracking cookies
 */
export const initAdSenseCookies = () => {
  // AdSense automatically handles its own cookies through the adsbygoogle.js script
  // This function is a placeholder for any future custom AdSense cookie management

  // Mark that we've initialized cookie support
  setCookie('qwimgenv_cookies_enabled', 'true', {
    days: 365,
    secure: true,
    sameSite: 'Lax'
  });
};

/**
 * Check if user has accepted cookies (for future consent banner)
 * @returns {boolean} - True if cookies are accepted
 */
export const hasAcceptedCookies = () => {
  return getCookie('qwimgenv_cookies_enabled') === 'true';
};
