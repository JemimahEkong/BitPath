export interface LogOutState {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: (logoutType?: 'current' | 'all') => Promise<boolean>;
}