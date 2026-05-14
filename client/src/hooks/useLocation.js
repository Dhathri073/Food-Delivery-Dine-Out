import { useState, useCallback, useEffect } from 'react';
import {
  requestLocation,
  getCachedLocation,
  clearLocationCache,
  checkLocationPermission
} from '../lib/geolocation';

/**
 * Custom hook for geolocation detection
 * Manages location state, permissions, and error handling
 */
export const useLocation = (autoRequest = false) => {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, requesting, granted, denied, error, profile
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState(null);

  // Check cached location on mount
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached) {
      setCoords(cached);
      setStatus('cached');
    }
  }, []);

  // Check permission state on mount
  useEffect(() => {
    checkLocationPermission().then(setPermissionState);
  }, []);

  // Auto-request location if enabled
  useEffect(() => {
    if (autoRequest && status === 'idle') {
      requestUserLocation();
    }
  }, [autoRequest]);

  const requestUserLocation = useCallback(async () => {
    setStatus('requesting');
    setError(null);
    try {
      const location = await requestLocation();
      setCoords(location);
      setStatus('granted');
      return location;
    } catch (err) {
      setError(err.message);
      setStatus('error');
      throw err;
    }
  }, []);

  const clearLocation = useCallback(() => {
    clearLocationCache();
    setCoords(null);
    setStatus('idle');
    setError(null);
  }, []);

  const retry = useCallback(() => {
    return requestUserLocation();
  }, [requestUserLocation]);

  return {
    coords,
    status,
    error,
    permissionState,
    requestUserLocation,
    clearLocation,
    retry,
    isRequesting: status === 'requesting',
    isGranted: status === 'granted',
    isDenied: status === 'denied' || status === 'error',
    isCached: status === 'cached'
  };
};

export default useLocation;
