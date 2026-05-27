export interface LoginState {
  // State
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  
  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRememberMe: (rememberMe: boolean) => void;
  login: (email: string, password: string, rememberMe?: boolean, recaptchaToken?: string) => Promise<LoginResponse>;
}

export interface LoginResponse {
  success: boolean;
  requiresVerification?: boolean;
  deviceId?: string;
  deviceStatus?: string;
  user?: any;
  message?: string;
}