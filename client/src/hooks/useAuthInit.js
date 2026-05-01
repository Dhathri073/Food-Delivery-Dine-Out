import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { connectSocket } from '../lib/socket';

export const useAuthInit = () => {
  const { token, refreshUser } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    if (token) {
      connectSocket(token);
      // Verify token is still valid
      refreshUser().catch(err => {
        console.warn('Token validation failed:', err);
      });
    }
  }, []); // Only run once on mount

  return token;
};
