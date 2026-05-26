import { registerAs } from '@nestjs/config';

export default registerAs('linkedinOAuth', () => ({
  clientID: process.env.BITPATH_LINKEDIN_CLIENT_ID,
  clientSecret: process.env.BITPATH_LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.BITPATH_LINKEDIN_CALLBACK,
}));
