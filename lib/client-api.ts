import axios from 'axios';

const clientApi = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
  timeout: 30000,
});

export default clientApi;
