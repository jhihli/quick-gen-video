/**
 * Shared letterbox calculation utility
 * Replicates FFmpeg's exact algorithm: scale=W:H:force_original_aspect_ratio=decrease,pad=W:H:(ow-iw)/2:(oh-ih)/2:black
 *
 * This is the SINGLE SOURCE OF TRUTH for letterbox calculations across:
 * - PreviewFrame (photo rendering)
 * - AvatarPreview (position calculations)
 * - Backend video processor (avatar overlay)
 */

/**
 * Calculate letterbox dimensions and offset for a photo in a frame
 * @param {number} photoWidth - Original photo width in pixels
 * @param {number} photoHeight - Original photo height in pixels
 * @param {number} frameWidth - Target frame width in pixels
 * @param {number} frameHeight - Target frame height in pixels
 * @returns {Object} { width, height, left, top } - Scaled photo dimensions and offset
 */
export const calculateLetterbox = (photoWidth, photoHeight, frameWidth, frameHeight) => {
  // Handle missing photo dimensions - use full frame
  if (!photoWidth || !photoHeight) {
    return {
      width: frameWidth,
      height: frameHeight,
      left: 0,
      top: 0
    };
  }

  const photoAspect = photoWidth / photoHeight;
  const frameAspect = frameWidth / frameHeight;

  let scaledWidth, scaledHeight;

  if (photoAspect > frameAspect) {
    // Photo is wider - scale to fit width, add padding top/bottom
    scaledWidth = frameWidth;
    scaledHeight = Math.round(frameWidth / photoAspect);
  } else {
    // Photo is taller or same - scale to fit height, add padding left/right
    scaledWidth = Math.round(frameHeight * photoAspect);
    scaledHeight = frameHeight;
  }

  // Center the scaled photo (matching FFmpeg's pad formula: (ow-iw)/2 and (oh-ih)/2)
  const left = Math.floor((frameWidth - scaledWidth) / 2);
  const top = Math.floor((frameHeight - scaledHeight) / 2);

  return {
    width: scaledWidth,
    height: scaledHeight,
    left,
    top
  };
};
