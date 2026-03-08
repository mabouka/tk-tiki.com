'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { clearAuthToken, setAuthToken } from '../lib/api';

export function AuthSessionBridge() {
  const { data, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (data?.backendToken) {
      setAuthToken(data.backendToken);
      return;
    }

    clearAuthToken();
  }, [data, status]);

  return null;
}
