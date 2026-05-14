/**
 * Geolocation utility functions
 * Handles browser geolocation API with caching and error handling
 */

// Cache keys
const LOCATION_CACHE_KEY = 'user_location';
const LOCATION_TIMESTAMP_KEY = 'user_location_timestamp';
const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached location if valid
 */
export const getCachedLocation = () => {
  const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  const timestamp = localStorage.getItem(LOCATION_TIMESTAMP_KEY);

  if (!cached || !timestamp) return null;

  const age = Date.now() - parseInt(timestamp);
  if (age > LOCATION_CACHE_DURATION) {
    // Cache expired
    localStorage.removeItem(LOCATION_CACHE_KEY);
    localStorage.removeItem(LOCATION_TIMESTAMP_KEY);
    return null;
  }

  return JSON.parse(cached);
};

/**
 * Cache location with timestamp
 */
export const cacheLocation = (location) => {
  localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  localStorage.setItem(LOCATION_TIMESTAMP_KEY, Date.now().toString());
};

/**
 * Request user location with Promise-based API
 * Returns: { lat, lng, accuracy } or throws error
 */
export const requestLocation = (timeout = 8000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude, accuracy } = position.coords;
        const location = { 
          lat: latitude, 
          lng: longitude, 
          accuracy: Math.round(accuracy)
        };
        cacheLocation(location);
        resolve(location);
      },
      (error) => {
        clearTimeout(timeoutId);
        let message = 'Failed to get location';
        
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out';
        }
        
        reject(new Error(message));
      },
      {
        timeout,
        enableHighAccuracy: false, // Set to true for production if needed
        maximumAge: 0 // Don't use cached position
      }
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceInMeters) => {
  if (!distanceInMeters && distanceInMeters !== 0) return 'N/A';
  const km = distanceInMeters / 1000;
  if (km < 1) return `${Math.round(distanceInMeters)} m`;
  return `${km.toFixed(1)} km`;
};

/**
 * Clear cached location
 */
export const clearLocationCache = () => {
  localStorage.removeItem(LOCATION_CACHE_KEY);
  localStorage.removeItem(LOCATION_TIMESTAMP_KEY);
};

/**
 * Check if location permission is available
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return null; // Cannot determine permission
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    return null;
  }
};
