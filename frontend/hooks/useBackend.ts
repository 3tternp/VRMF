import { useAuth } from '../contexts/AuthContext';
import backend from '~backend/client';

export function useBackend() {
  const { token } = useAuth();
  
  if (!token) {
    return backend;
  }
  
  return backend.with({
    auth: async () => ({ authorization: `Bearer ${token}` })
  });
}
