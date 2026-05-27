// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_LOCAL_URL,
  withCredentials: true, 
});

// Add a request interceptor
api.interceptors.request.use(
  function (config) {
    console.log(
      'sending the request to the server: ',
      config.baseURL! + config.url,
      'RequestData: ',
      JSON.stringify(config.data)
    );

    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    console.log(
      'sending the request to the server: ',
      response.config.baseURL + response.config.url!,
      'ResponseData: ',
      JSON.stringify(response.data)
    );
    return response;
  },
  function (error) {
    // If we get 401 Unauthorized or 403 Forbidden - redirect to login!
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('🔐 Session expired or invalid - redirecting to login!');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;