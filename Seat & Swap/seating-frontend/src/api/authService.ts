import axios from "axios";


const API_BASE_URL = 'http://localhost:8000/api';
const REFRESH_TOKEN_URL = `${API_BASE_URL}/token/refresh/`;

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setAccessToken = (token:string) => localStorage.setItem('accessToken', token);

export const setRefreshToken = (token:string) => localStorage.setItem('refreshToken', token);

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  console.log(refreshToken)
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await axios.post(REFRESH_TOKEN_URL, {
    'refresh':refreshToken
  },{
    headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
  });
  console.log(response)
  setAccessToken(response.data.access);
  return response.data.response.accessToken;
};