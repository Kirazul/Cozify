/**
 * Utility for anime image URLs
 * Returns original URL - the API already provides good quality images
 */

/**
 * Get image URL (passthrough - API images are already good quality)
 * @param {string} url - Original image URL
 * @returns {string} - Image URL
 */
export function getHighQualityImage(url) {
  return url || '';
}

/**
 * Get banner/cover image
 * @param {string} url - Original image URL  
 * @returns {string} - Banner URL
 */
export function getBannerImage(url) {
  return url || '';
}

/**
 * Preload image for smoother UX
 * @param {string} url - Image URL to preload
 */
export function preloadImage(url) {
  if (!url) return;
  const img = new Image();
  img.src = url;
}

export default { getHighQualityImage, getBannerImage, preloadImage };
