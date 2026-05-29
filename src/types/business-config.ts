export interface BusinessConfigDto {
  businessName: string;
  timezone: string;
  currency: string;
}

export interface BusinessConfigResponse {
  success: boolean;
  message: string;
  data?: {
    onboardingCompleted: boolean;
    user: {
      businessName: string;
      timezone: string;
      currency: string;
    };
  };
  requestId?: string;
}
