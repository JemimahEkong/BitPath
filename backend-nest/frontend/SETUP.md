# Environment Setup

Create a `.env.local` file in the root of your project with the following variables:

```env
# Server Configuration
NEXT_PUBLIC_SERVER_LOCAL_URL=http://localhost:8000

# Google reCAPTCHA v3 Configuration
# Get these keys from: https://www.google.com/recaptcha/admin/create
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Other Environment Variables
NODE_ENV=development
```

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Sign in with your Google account
3. Fill out the form:
   - Label: Your project name (e.g., "RevOps AI Dashboard")
   - reCAPTCHA type: reCAPTCHA v3
   - Domains: localhost (for development) and your production domain
4. Accept the terms of service
5. Submit and get your Site Key and Secret Key
6. Add them to your `.env.local` file

## Features Implemented

### ✅ Login Page Enhancements:
- **Remember Me**: Stores user preference in localStorage
- **reCAPTCHA v3**: Bot protection with graceful degradation
- **Toast Notifications**: Success/error messages with react-hot-toast
- **Enhanced Security**: Secure cookies with httpOnly flag
- **Redirect Handling**: Proper redirect after login

### ✅ API Endpoints:
- `/api/auth/login`: Handles authentication with reCAPTCHA verification
- `/api/auth/signup`: User registration with validation
- `/api/auth/check`: Session validation for middleware

### ✅ Next.js 16 Proxy:
- Server-side route protection
- Authentication, email verification, and onboarding checks
- Modern Next.js 16 syntax with `proxy.ts`

## Testing

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/login`
3. Test login with remember me and reCAPTCHA
4. Check browser console for authentication logs
5. Verify toast notifications appear for success/error states
