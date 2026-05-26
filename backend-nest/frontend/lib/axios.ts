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
api.interceptors.response.use(function (response) {
  console.log(
    'sending the request to the server: ',
    response.config.baseURL + response.config.url!,
    'ResponseData: ',
    JSON.stringify(response.data)
  );
  return response;
});

export default api;