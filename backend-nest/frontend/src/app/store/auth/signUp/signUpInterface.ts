export interface SignUpState {
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signup: (signupData: any) => Promise<boolean>;
}