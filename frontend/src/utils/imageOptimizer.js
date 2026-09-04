/**
 * Image size presets
 */
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 100, height: 100, quality: 0.7 },
  SMALL: { width: 200, height: 200, quality: 0.7 },
  MEDIUM: { width: 400, height: 400, quality: 0.8 },
  LARGE: { width: 800, height: 800, quality: 0.85 },
  COVER: { width: 1200, height: 600, quality: 0.9 },
  ORIGINAL: { width: null, height: null, quality: 1 },
};

/**
 * Get optimized image URL with query parameters for CDN
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '/placeholder-image.jpg';
  
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If URL is from a CDN that supports query params
  if (url.includes('cloudinary.com')) {
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    const parts = url.split('/upload/');
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }
  
  // For other URLs, just return original
  return url;
};

/**
 * Get image URL with specific size preset
 * @param {string} url - Original image URL
 * @param {string} size - Size preset key
 * @returns {string} Resized image URL
 */
export const getResizedImage = (url, size = 'MEDIUM') => {
  const preset = IMAGE_SIZES[size];
  if (!preset) return url;
  
  return getOptimizedImageUrl(url, {
    width: preset.width,
    height: preset.height,
    quality: preset.quality,
  });
};

/**
 * Get thumbnail image URL
 * @param {string} url - Original image URL
 * @returns {string} Thumbnail URL
 */
export const getThumbnail = (url) => {
  return getResizedImage(url, 'THUMBNAIL');
};

/**
 * Get cover image URL
 * @param {string} url - Original image URL
 * @returns {string} Cover image URL
 */
export const getCoverImage = (url) => {
  return getResizedImage(url, 'COVER');
};

/**
 * Convert file to base64
 * @param {File} file - File object
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compress image file
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputType = 'image/jpeg',
  } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateImage = (file, options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  } = options;
  
  const result = { valid: true, error: null };
  
  if (!file) {
    result.valid = false;
    result.error = 'No file selected';
    return result;
  }
  
  if (!allowedTypes.includes(file.type)) {
    result.valid = false;
    result.error = `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    return result;
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    result.valid = false;
    result.error = `File size exceeds ${maxSizeMB}MB limit`;
    return result;
  }
  
  return result;
};

/**
 * Get image dimensions
 * @param {File|string} source - Image file or URL
 * @returns {Promise<Object>} Image dimensions
 */
export const getImageDimensions = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    
    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
      URL.revokeObjectURL(url);
    }
  });
};

/**
 * Create placeholder image URL
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {string} text - Placeholder text
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = (width = 400, height = 300, text = 'No Image') => {
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
};

/**
 * Get avatar URL from name
 * @param {string} name - Person's name
 * @param {number} size - Avatar size in pixels
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (name, size = 128) => {
  if (!name) return `/default-avatar.png`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff4757&color=fff&size=${size}`;
};

/**
 * Get restaurant cover placeholder
 * @returns {string} Cover placeholder URL
 */
export const getRestaurantCoverPlaceholder = () => {
  return '/images/restaurant-cover-placeholder.jpg';
};

/**
 * Get food item placeholder
 * @returns {string} Food placeholder URL
 */
export const getFoodPlaceholder = () => {
  return '/images/food-placeholder.jpg';
};

/**
 * Preload image
 * @param {string} url - Image URL
 * @returns {Promise} Promise that resolves when image is loaded
 */
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Preload multiple images
 * @param {Array} urls - Array of image URLs
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export const preloadImages = (urls) => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

export default {
  IMAGE_SIZES,
  getOptimizedImageUrl,
  getResizedImage,
  getThumbnail,
  getCoverImage,
  fileToBase64,
  compressImage,
  validateImage,
  getImageDimensions,
  getPlaceholderImage,
  getAvatarUrl,
  getRestaurantCoverPlaceholder,
  getFoodPlaceholder,
  preloadImage,
  preloadImages,
};